import { Octokit } from "@octokit/rest";
import { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";
import grayMatter from "gray-matter";
import slugify from "slugify";
import type PostType from "../interfaces/post";
import { GH_REPO, GH_USER } from "./siteConfig";

if (!process.env.GH_TOKEN) {
  throw new Error("Please set the GH_TOKEN environment variable");
}

const publishedTags =
  process.env.NODE_ENV === "development" ? ["Published"] : ["Published"];

const octokit = new Octokit({ auth: process.env.GH_TOKEN });
type GHIssue = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.issues.listForRepo
>[number];

const fetchWrapper = async (...args: Parameters<typeof fetch>) => {
  const [url, options] = args;
  return await fetch(url, {
    ...options,
    next: { revalidate: 3600 }, // revalidate every hour
  });
};

// TODO:Handle the pagination of the GitHub API
export async function getAllPosts(page: number = 1) {
  try {
    const result = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      page: page,
      per_page: 100,
      owner: GH_USER,
      repo: GH_REPO,
      labels: publishedTags.join(","),
      request: {
        fetch: fetchWrapper,
      },
    });
    return result.data.map(parseIssue);
  } catch (e) {
    console.log(`Error getting posts ${e instanceof Error ? e.message : ""}`);
  }

  return [];
}

export async function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const id = Number(realSlug.split("_")[0] ?? -1);
  if (id === -1) {
    return null;
  }

  const result = await octokit.request(
    "GET /repos/{owner}/{repo}/issues/{issue_number}",
    {
      issue_number: id,
      owner: GH_USER,
      repo: GH_REPO,
      labels: publishedTags.join(","),
      request: {
        fetch: fetchWrapper,
      },
    },
  );

  return parseIssue(result.data);
}

function parseIssue(issue: GHIssue): PostType {
  const src = issue.body ?? "";
  const data = grayMatter(src);
  let title = issue.title;
  let slug;
  if (data.data.slug) {
    slug = data.data.slug;
  } else {
    slug = slugify(issue.number + "_" + title);
  }
  let date = data.data.date ?? issue.created_at;
  console.log(title, date, data.data.date, issue.created_at);
  const labelNames = issue.labels
    .map((label) => (typeof label === "string" ? label : label.name))
    .filter((label): label is NonNullable<typeof label> => !!label);

  return {
    content: data.content,
    title,
    slug: slug.toLowerCase(),
    date: date,
    excerpt: data.data.excerpt ?? "",
    labels: labelNames.filter((label) => !publishedTags.includes(label)),
    isDraft: labelNames.some((label) => label === "Draft"),
  };
}
