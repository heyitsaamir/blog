import { GetServerSideProps } from "next";
import { getAllPosts } from "../lib/postsApi";
import { SITE_URL } from "../lib/constants";

function generateSiteMap(posts: { slug: string; date: string }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Homepage -->
     <url>
       <loc>${SITE_URL}</loc>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <!-- Posts listing page -->
     <url>
       <loc>${SITE_URL}/posts</loc>
       <changefreq>daily</changefreq>
       <priority>0.8</priority>
     </url>
     <!-- Individual blog posts -->
     ${posts
       .map(({ slug, date }) => {
         return `
       <url>
         <loc>${SITE_URL}/posts/${slug}</loc>
         <lastmod>${new Date(date).toISOString()}</lastmod>
         <changefreq>monthly</changefreq>
         <priority>0.7</priority>
       </url>
     `;
       })
       .join("")}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will handle the response
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Fetch all posts
  const posts = await getAllPosts();

  // Generate the XML sitemap
  const sitemap = generateSiteMap(
    posts.map((post) => ({
      slug: post.slug,
      date: post.date,
    }))
  );

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
