import { format, parseISO } from "date-fns";
import Link from "next/link";
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
      <Layout head={<title>aamir j. blog</title>} isIndexPage>
        <section className="md:mx-48 flex flex-col gap-12 py-8">
          <div>
            <p className="mb-12">
              <em>
                Hi! I'm Aamir. I'm a software engineer. I love tinkering with code and trying out new technologies to build useful (and useless) things.
                I currently work for Microsoft. In this blog, I talk about stuff I'm learning, things I find interesting, and sometimes just random thoughts.
              </em>
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
