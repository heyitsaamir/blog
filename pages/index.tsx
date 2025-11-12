import { format, parseISO } from "date-fns";
import Link from "next/link";
import Layout from "../components/layout";
import Post from "../interfaces/post";
import { getAllPosts } from "../lib/postsApi";

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
      <Layout head={<title>aamir j. blog</title>} isIndexPage>
        <section className="md:mx-48 flex flex-col gap-12 py-8">
          <div>
            <p className="mb-12">
              <em>
                Hi! I’m Aamir. I write code for a living at Microsoft and for fun everywhere else.
This blog is where I dump things I’ve learned, ideas I’m curious about, and whatever nonsense I convinced myself was worth sharing.              </em>
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
  };
};
