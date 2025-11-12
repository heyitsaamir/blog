import type PostType from "../interfaces/post";
import { getAllPosts as getAllGithubPosts, getPostBySlug as getGithubPostBySlug } from "./githubApi";
import { getAllLeafletPosts, getLeafletPostBySlug } from "./leafletApi";

export async function getAllPosts(page: number = 1): Promise<PostType[]> {
  try {
    const [githubPosts, leafletPosts] = await Promise.all([
      getAllGithubPosts(page),
      getAllLeafletPosts(),
    ]);

    const allPosts = [...(githubPosts || []), ...leafletPosts];
    
    // Filter out invalid posts and sort by date (newest first)
    return allPosts
      .filter((post) => post && !post.isDraft && post.title && post.date && post.slug)
      .map((post) => ({
        ...post,
        labels: post.labels?.filter(Boolean) || [],
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        
        // Handle NaN dates by putting them at the end
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        
        return dateB - dateA;
      });
  } catch (error) {
    console.log(
      `Error getting all posts: ${error instanceof Error ? error.message : ""}`
    );
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<PostType | null> {
  try {
    // Try GitHub first, then Leaflet
    const githubPost = await getGithubPostBySlug(slug);
    if (githubPost) {
      return githubPost;
    }

    const leafletPost = await getLeafletPostBySlug(slug);
    if (leafletPost) {
      return leafletPost;
    }

    return null;
  } catch (error) {
    console.log(
      `Error getting post by slug: ${error instanceof Error ? error.message : ""}`
    );
    return null;
  }
}

export async function getPostsBySource(source: 'github' | 'leaflet'): Promise<PostType[]> {
  try {
    if (source === 'github') {
      const posts = await getAllGithubPosts();
      return posts || [];
    } else {
      return await getAllLeafletPosts();
    }
  } catch (error) {
    console.log(
      `Error getting posts by source: ${error instanceof Error ? error.message : ""}`
    );
    return [];
  }
}