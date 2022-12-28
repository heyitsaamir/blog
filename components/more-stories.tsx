import PostPreview from './post-preview';
import type Post from '../interfaces/post';

type Props = {
  posts: Post[];
};

const MoreStories = ({ posts }: Props) => {
  return (
    <section>
      <h2 className="mb-8 text-3xl md:text-5xl font-bold tracking-tighter leading-tight">
        More Posts
      </h2>
      <div className="grid grid-cols-1 md:w-4/5 gap-y-8">
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
    </section>
  );
};

export default MoreStories;
