import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import Layout from "../../components/layout";
import PostBody from "../../components/post-body";
import PostHeader from "../../components/post-header";
import PostTitle from "../../components/post-title";
import type PostType from "../../interfaces/post";
import { getAllPosts, getPostBySlug } from "../../lib/githubApi";
import markdownToHtml from "../../lib/markdownToHtml";

type Props = {
  post: PostType;
  morePosts: PostType[];
};

export default function Post({ post, morePosts }: Props) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout>
      {router.isFallback ? <PostTitle>Loading…</PostTitle> : (
        <article className="mb-32 mt-20">
          <Head>
            <title>{post.title}</title>
            {post.ogImage?.url && (
              <meta property="og:image" content={post.ogImage.url} />
            )}
          </Head>
          <PostHeader
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            labels={post.labels}
          />
          <PostBody content={post.content} />
        </article>
      )}

      <Script
        type="module"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
        import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@9/dist/mermaid.esm.min.mjs";
        mermaid.initialize({
          startOnLoad: true,  
          securityLevel: 'loose',
          theme: 'dark',
          themeVariables: {
            darkMode: true,
          },
          sequence: {
            useMaxWidth: false,
          },
          flowChart: {
            useMaxWidth: false,
          }
        });
        mermaid.contentLoaded();
        `,
        }}
      />
    </Layout>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      notFound: true,
    };
  }
  const content = await markdownToHtml(post.content || "");

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = await getAllPosts();

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}
