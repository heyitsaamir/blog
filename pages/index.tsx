import Container from "../components/container";
import HeroPost from "../components/hero-post";
import Intro from "../components/intro";
import Layout from "../components/layout";
import { getAllPosts } from "../lib/githubApi";
import Head from "next/head";
import Post from "../interfaces/post";
import { getRaindrops } from "../lib/raindrop";
import { Bookmark } from "../interfaces/bookmark";
import { SingleBookmark } from "../components/SingleBookmark";
import { LinkButton } from "../components/LinkButton";

type Props = {
  latestPost: Post;
  bookmarks: Bookmark[];
};

export const revalidate = 3600; // revalidate every hour

export default function Index({ latestPost, bookmarks }: Props) {
  return (
    <>
      <Layout>
        <Head>
          <title>aamir j. blog</title>
        </Head>
        <Container>
          <Intro />
          <section className="md:mx-48 flex flex-col gap-8">
            {latestPost && (
              <HeroPost
                title={latestPost.title}
                coverImage={latestPost.coverImage}
                date={latestPost.date}
                slug={latestPost.slug}
                excerpt={latestPost.excerpt}
              />
            )}
            <div className="flex flex-row gap-4 justify-center">
              <LinkButton href="/posts" className="bg-stone-700">
                More Posts
              </LinkButton>
            </div>
            {bookmarks && (
              <div className=" dark:bg-stone-600 bg-stone-200 p-8 rounded-md shadow-md">
                <h2 className="mb-4 text-lg font-bold tracking-tighter leading-tight">
                  Bookmarks
                </h2>
                <ul className="flex flex-col gap-8">
                  {bookmarks.map((bookmark) => {
                    return (
                      <li key={bookmark._id}>
                        <SingleBookmark bookmark={bookmark} />
                      </li>
                    );
                  })}
                </ul>
                <div className="flex mt-4 justify-end">
                  <LinkButton href="/bookmarks">More &rarr;</LinkButton>
                </div>
              </div>
            )}
          </section>
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async () => {
  const allPosts = await getAllPosts();

  const bookmarks = (await getRaindrops())?.slice(0, 5) ?? null;

  return {
    props: { latestPost: allPosts.at(0) ?? null, bookmarks },
  };
};
