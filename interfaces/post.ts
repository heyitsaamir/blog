import type Author from './author';

type PostType = {
  slug: string;
  title: string;
  date: string;
  coverImage?: string;
  excerpt: string;
  ogImage?: {
    url: string;
  };
  content: string;
  labels: string[];
};

export default PostType;
