import Container from "../../components/container";
import Header from "../../components/header";
import Layout from "../../components/layout";
import StoriesList from "../../components/stories-list";
import Post from "../../interfaces/post";
import { getAllPosts } from "../../lib/githubApi";

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
            <StoriesList posts={allPosts} />
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
