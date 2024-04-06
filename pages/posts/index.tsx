import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import Layout from "../../components/layout";
import { getAllPosts } from "../../lib/githubApi";
import Post from "../../interfaces/post";
import Header from "../../components/header";
import Script from "next/script";

type Props = {
  allPosts: Post[];
};

export default function Index({ allPosts }: Props) {
  return (
    <>
      <Layout>
        <Container>
          <Header />
          <section>
            <MoreStories posts={allPosts} />
          </section>
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async () => {
  const allPosts = await getAllPosts();

  return {
    props: { allPosts },
  };
};
