import Head from "next/head";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  AUTHOR_NAME,
  TWITTER_HANDLE,
} from "../lib/constants";

type MetaProps = {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  canonicalUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
};

const Meta = ({
  title,
  description = SITE_DESCRIPTION,
  ogImage,
  ogType = "website",
  canonicalUrl,
  publishedTime,
  modifiedTime,
  tags = [],
}: MetaProps = {}) => {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const defaultOgImage = `${SITE_URL}/favicon/android-chrome-512x512.png`;
  const ogImageUrl = ogImage || defaultOgImage;
  const canonical = canonicalUrl || SITE_URL;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      <meta name="author" content={AUTHOR_NAME} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Article specific Open Graph tags */}
      {ogType === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === "article" && (
        <meta property="article:author" content={AUTHOR_NAME} />
      )}
      {tags.map((tag) => (
        <meta property="article:tag" content={tag} key={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />

      {/* Favicon and App Icons */}
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/favicon/safari-pinned-tab.svg"
        color="#000000"
      />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />

      {/* MS Application */}
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      <meta name="theme-color" content="#000" />

      {/* RSS Feed */}
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
    </Head>
  );
};

export default Meta;
