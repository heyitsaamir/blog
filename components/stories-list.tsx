import type Post from "../interfaces/post";
import PostPreview from "./post-preview";

type Props = {
  posts: Post[];
};

const StoriesList = ({ posts }: Props) => {
  return (
    <>
      <h2 className="text-6xl font-bold text-center">Posts</h2>
      <div className="grid grid-cols-1 gap-y-8 px-2 md:px-20">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </>
  );
};

export default StoriesList;
