import Container from '../components/container';
import MoreStories from '../components/more-stories';
import HeroPost from '../components/hero-post';
import Intro from '../components/intro';
import Layout from '../components/layout';
import { getAllPosts } from '../lib/api';
import Head from 'next/head';
import { CMS_NAME } from '../lib/constants';
import Post from '../interfaces/post';
import { getRaindrops } from '../lib/raindrop';
import { Bookmark } from '../interfaces/bookmark';
import { SingleBookmark } from '../components/SingleBookmark';

type Props = {
  latestPost: Post;
  bookmarks: Bookmark[];
};

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
            {bookmarks && (
              <div className=" bg-stone-600 p-8 rounded-md">
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
              </div>
            )}
          </section>
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async () => {
  const allPosts = getAllPosts([
    'title',
    'date',
    'slug',
    'author',
    'coverImage',
    'excerpt',
  ]);

  const bookmarks = await getRaindrops();

  return {
    props: { latestPost: allPosts.at(0), bookmarks },
  };
};
