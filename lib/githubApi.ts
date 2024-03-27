import grayMatter from 'gray-matter';
import mdx from '@mdx-js/mdx';
import fetch from 'node-fetch';
import { GH_USER, GH_REPO } from './siteConfig';
import parse from 'parse-link-header';
import slugify from 'slugify';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutoLink from 'rehype-autolink-headings';
import { Octokit } from '@octokit/rest';
import type PostType from '../interfaces/post';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';

if (!process.env.GH_TOKEN) {
  throw new Error('Please set the GH_TOKEN environment variable');
}

const remarkPlugins = undefined;
const rehypePlugins = [rehypeStringify, rehypeSlug, rehypeAutoLink];

const publishedTags = ['Published'];
let allBlogposts = [];

const octokit = new Octokit({ auth: process.env.GH_TOKEN });

type GHIssue = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.issues.listForRepo
>[number];

// TODO:Handle the pagination of the GitHub API
export async function getAllPosts(page: number = 1) {
  const result = await octokit.request('GET /repos/{owner}/{repo}/issues', {
    page: page,
    per_page: 100,
    owner: GH_USER,
    repo: GH_REPO,
    labels: publishedTags.join(','),
  });

  return result.data.map((issue) => parseIssue(issue));
}

export async function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, '');
  const id = Number(realSlug.split('_')[0] ?? -1);
  if (id === -1) {
    return null;
  }

  const result = await octokit.request(
    'GET /repos/{owner}/{repo}/issues/{issue_number}',
    {
      issue_number: id,
      owner: GH_USER,
      repo: GH_REPO,
      labels: publishedTags.join(','),
    }
  );

  return parseIssue(result.data);
}

function parseIssue(issue: GHIssue): PostType {
  const src = issue.body ?? '';
  const data = grayMatter(src);
  let title = issue.title;
  let slug;
  if (data.data.slug) {
    slug = data.data.slug;
  } else {
    slug = slugify(issue.number + '_' + title);
  }
  let date = data.data.date ?? issue.created_at;

  return {
    content: data.content,
    title,
    slug: slug.toLowerCase(),
    date: date,
    excerpt: data.data.excerpt ?? '',
    labels: issue.labels
      .map((label) => (typeof label === 'string' ? label : label.name))
      .filter((label): label is NonNullable<typeof label> => !!label),
  };
}
