import Container from "../components/container";
import Header from "../components/header";
import Layout from "../components/layout";
import { getAllPosts, getPostBySlug } from "../lib/githubApi";
import type { Bookmark } from "../interfaces/bookmark";
import { SingleBookmark } from "../components/SingleBookmark";

type Props = {
  posts: any;
};

export default function Bookmarks({ posts }: Props) {
  return (
    <Layout>
      <Container>
        <Header />
        <h2 className="text-6xl font-bold text-center">Posts</h2>
        <pre>
            {JSON.stringify(posts, null, 2)}
        </pre>
        {
          /* <ul className="flex flex-col gap-8">
          {bookmarks.map((bookmark) => {
            return (
              <li key={bookmark._id}>
                <SingleBookmark bookmark={bookmark} />
              </li>
            );
          })}
        </ul> */
        }
      </Container>
    </Layout>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const posts = await getAllPosts();

  return {
    props: {
      posts,
    },
  };
}

/**
 * {
  "status": 200,
  "url": "https://api.github.com/repos/heyitsaamir/blog-next-js/issues?page=1&per_page=10&labels=Published",
  "headers": {
    "access-control-allow-origin": "*",
    "access-control-expose-headers": "ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Resource, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, X-GitHub-SSO, X-GitHub-Request-Id, Deprecation, Sunset",
    "cache-control": "private, max-age=60, s-maxage=60",
    "content-encoding": "gzip",
    "content-security-policy": "default-src 'none'",
    "content-type": "application/json; charset=utf-8",
    "date": "Wed, 27 Mar 2024 14:05:53 GMT",
    "etag": "W/\"89b50b21a78ef0e16584f16e4b169b3530dc1ce954a33b991be46638b267626c\"",
    "referrer-policy": "origin-when-cross-origin, strict-origin-when-cross-origin",
    "server": "GitHub.com",
    "strict-transport-security": "max-age=31536000; includeSubdomains; preload",
    "transfer-encoding": "chunked",
    "vary": "Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding, Accept, X-Requested-With",
    "x-accepted-oauth-scopes": "repo",
    "x-content-type-options": "nosniff",
    "x-frame-options": "deny",
    "x-github-api-version-selected": "2022-11-28",
    "x-github-media-type": "github.v3; format=json",
    "x-github-request-id": "F784:1CD9CB:2AFCB38:4B41E7B:660427C0",
    "x-oauth-scopes": "public_repo",
    "x-ratelimit-limit": "5000",
    "x-ratelimit-remaining": "4982",
    "x-ratelimit-reset": "1711549411",
    "x-ratelimit-resource": "core",
    "x-ratelimit-used": "18",
    "x-xss-protection": "0"
  },
  "data": [
    {
      "url": "https://api.github.com/repos/heyitsaamir/blog-next-js/issues/1",
      "repository_url": "https://api.github.com/repos/heyitsaamir/blog-next-js",
      "labels_url": "https://api.github.com/repos/heyitsaamir/blog-next-js/issues/1/labels{/name}",
      "comments_url": "https://api.github.com/repos/heyitsaamir/blog-next-js/issues/1/comments",
      "events_url": "https://api.github.com/repos/heyitsaamir/blog-next-js/issues/1/events",
      "html_url": "https://github.com/heyitsaamir/blog-next-js/issues/1",
      "id": 2210901441,
      "node_id": "I_kwDOIrAXI86Dx63B",
      "number": 1,
      "title": "Test",
      "user": {
        "login": "heyitsaamir",
        "id": 48929123,
        "node_id": "MDQ6VXNlcjQ4OTI5MTIz",
        "avatar_url": "https://avatars.githubusercontent.com/u/48929123?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/heyitsaamir",
        "html_url": "https://github.com/heyitsaamir",
        "followers_url": "https://api.github.com/users/heyitsaamir/followers",
        "following_url": "https://api.github.com/users/heyitsaamir/following{/other_user}",
        "gists_url": "https://api.github.com/users/heyitsaamir/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/heyitsaamir/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/heyitsaamir/subscriptions",
        "organizations_url": "https://api.github.com/users/heyitsaamir/orgs",
        "repos_url": "https://api.github.com/users/heyitsaamir/repos",
        "events_url": "https://api.github.com/users/heyitsaamir/events{/privacy}",
        "received_events_url": "https://api.github.com/users/heyitsaamir/received_events",
        "type": "User",
        "site_admin": false
      },
      "labels": [
        {
          "id": 6748063096,
          "node_id": "LA_kwDOIrAXI88AAAABkjdFeA",
          "url": "https://api.github.com/repos/heyitsaamir/blog-next-js/labels/Published",
          "name": "Published",
          "color": "49B631",
          "default": false,
          "description": ""
        }
      ],
      "state": "open",
      "locked": false,
      "assignee": null,
      "assignees": [],
      "milestone": null,
      "comments": 0,
      "created_at": "2024-03-27T14:05:46Z",
      "updated_at": "2024-03-27T14:05:47Z",
      "closed_at": null,
      "author_association": "OWNER",
      "active_lock_reason": null,
      "body": "Foobar",
      "reactions": {
        "url": "https://api.github.com/repos/heyitsaamir/blog-next-js/issues/1/reactions",
        "total_count": 0,
        "+1": 0,
        "-1": 0,
        "laugh": 0,
        "hooray": 0,
        "confused": 0,
        "heart": 0,
        "rocket": 0,
        "eyes": 0
      },
      "timeline_url": "https://api.github.com/repos/heyitsaamir/blog-next-js/issues/1/timeline",
      "performed_via_github_app": null,
      "state_reason": null
    }
  ]
}
 */
