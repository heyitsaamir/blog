import { GetStaticProps } from "next";
import Container from "../../components/container";
import Header from "../../components/header";
import Layout from "../../components/layout";
import StoriesList from "../../components/stories-list";
import Post from "../../interfaces/post";
import { getAllPosts } from "../../lib/postsApi";
import { SITE_URL } from "../../lib/constants";

type Props = {
  allPosts: Post[];
};

export default function Index({ allPosts }: Props) {
  return (
    <>
      <Layout
        meta={{
          title: "All Posts",
          description: "Browse all blog posts by Aamir Jawaid about life, tech, and other things.",
          canonicalUrl: `${SITE_URL}/posts`,
        }}
      >
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

export const getStaticProps: GetStaticProps = async () => {
  const allPosts = await getAllPosts();

  return {
    props: { allPosts }, revalidate: 3600, // revalidate every hour
  };
};
