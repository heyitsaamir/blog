import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import Layout from "../../components/layout";
import PostBody from "../../components/post-body";
import PostHeader from "../../components/post-header";
import PostTitle from "../../components/post-title";
import type PostType from "../../interfaces/post";
import { getAllPosts, getPostBySlug } from "../../lib/postsApi";
import markdownToHtml from "../../lib/markdownToHtml";
import {
  SITE_URL,
  SITE_NAME,
  AUTHOR_NAME,
} from "../../lib/constants";

type Props = {
  post: PostType;
  morePosts: PostType[];
};

export const revalidate = 3600; // revalidate every hour

export default function Post({ post, morePosts }: Props) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  const canonicalUrl = `${SITE_URL}/posts/${post?.slug}`;
  const postDescription = post?.excerpt || `${post?.title} - Read more on ${SITE_NAME}`;

  // JSON-LD structured data for blog posts
  const structuredData = post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": postDescription,
    "author": {
      "@type": "Person",
      "name": AUTHOR_NAME,
    },
    "publisher": {
      "@type": "Person",
      "name": AUTHOR_NAME,
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    "url": canonicalUrl,
    ...(post.ogImage?.url && { "image": post.ogImage.url }),
    ...(post.labels?.length && { "keywords": post.labels.join(", ") }),
  } : null;

  return (
    <Layout
      meta={{
        title: post?.title,
        description: postDescription,
        ogImage: post?.ogImage?.url,
        ogType: "article",
        canonicalUrl,
        publishedTime: post?.date,
        tags: post?.labels,
      }}
    >
      {router.isFallback ? <PostTitle>Loading…</PostTitle> : (
        <article className="mb-32 mt-20">
          <Head>
            {structuredData && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
              />
            )}
          </Head>
          <PostHeader
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            labels={post.labels}
            source={post.source}
            sourceUri={post.sourceUri}
          />
          <PostBody content={post.content} />
        </article>
      )}

      <Script
        type="module"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.esm.min.mjs"
      import elkLayouts from "https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk@latest/dist/mermaid-layout-elk.esm.min.mjs"

      // register ELK
      mermaid.registerLayoutLoaders(elkLayouts)

      const theme = localStorage.getItem('theme') ?? 'light';
      // Only set useMaxWidth to true if viewport is big (desktop)
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

      mermaid.initialize({
        startOnLoad: true,  
        securityLevel: "loose",
        look: "handDrawn",
        theme: theme === 'dark' ? 'dark' : 'base',
        themeVariables: theme === "light" ? {
        'primaryColor': '#FADA7A',
        'secondaryColor': '#FCE7C8',
        'tertiaryColor': '#B1C29E',
        } : undefined,
        sequence: {
          useMaxWidth: isDesktop,
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
    revalidate: 3600, // revalidate every hour
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
    fallback: 'blocking',
  };
}
