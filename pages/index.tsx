import { format, parseISO } from "date-fns";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/layout";
import Post from "../interfaces/post";
import { getAllPosts } from "../lib/postsApi";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, AUTHOR_NAME } from "../lib/constants";

type Props = {
posts: Post[];
};

const dateParser = Intl.DateTimeFormat("en-US", {
year: "numeric",
month: "long",
day: "numeric",
});

export default function Index({ posts }: Props) {
// JSON-LD structured data for the blog homepage
const structuredData = {
"@context": "https://schema.org",
"@type": "Blog",
"name": SITE_NAME,
"description": SITE_DESCRIPTION,
"url": SITE_URL,
"author": {
"@type": "Person",
"name": AUTHOR_NAME,
},
"blogPost": posts.slice(0, 10).map((post) => ({
"@type": "BlogPosting",
"headline": post.title,
"url": `${SITE_URL}/posts/${post.slug}`,
"datePublished": post.date,
...(post.excerpt && { "description": post.excerpt }),
})),
};

return (
<>
<Layout
meta={{
canonicalUrl: SITE_URL,
}}
isIndexPage
>
<Head>
<script
type="application/ld+json"
dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
/>
</Head>
<section className="md:mx-48 flex flex-col gap-12 py-8">
<div>
<p className="mb-12">
<em>
Hi! I'm Aamir. I write code sometimes professionally, sometimes for fun.
This blog is where I dump things I've learned, ideas I'm curious about, and whatever nonsense I convinced myself was worth sharing.              </em>
</p>
<ul className="flex flex-col gap-6">
{posts.map((post) => (
<li key={post.slug} className="flex flex-col">
<Link
href={`/posts/${post.slug}`}
className="text-lg text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-400 transition-colors"
>
{post.title}
</Link>
<span className="text-sm text-stone-500 dark:text-stone-400">
{format(parseISO(post.date), "MMMM d, yyyy")}
</span>
</li>
))}
</ul>
</div>
</section>
</Layout>
</>
);
}

export const getStaticProps = async () => {
const posts = await getAllPosts();

return {
props: { posts },
revalidate: 3600, // Fallback: regenerate every hour if not manually triggered
};
};
