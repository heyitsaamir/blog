import { format, parseISO } from "date-fns";
import Head from "next/head";
import Link from "next/link";
import Container from "../components/container";
import Layout from "../components/layout";
import Post from "../interfaces/post";
import { getAllPosts } from "../lib/githubApi";

type Props = {
  posts: Post[];
};

export const revalidate = 3600; // revalidate every hour

const dateParser = Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function Index({ posts }: Props) {
  return (
    <>
      <Layout>
        <Head>
          <title>aamir j. blog</title>
        </Head>
        <Container>
          <section className="md:mx-48 flex flex-col gap-12 py-8">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight pt-8 text-stone-900 dark:text-stone-100">
              <Link href="/" className="hover:underline underline-offset-3">
                aamir j
              </Link>
              .
            </h2>
            <div>
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
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async () => {
  const posts = await getAllPosts();

  return {
    props: { posts },
  };
};
