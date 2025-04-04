import Avatar from "./avatar";
import DateFormatter from "./date-formatter";
import CoverImage from "./cover-image";
import Link from "next/link";
import type Author from "../interfaces/author";

type Props = {
  title: string;
  coverImage?: string;
  date: string;
  excerpt: string;
  slug: string;
};

const HeroPost = ({ title, coverImage, date, excerpt, slug }: Props) => {
  return (
    <section className="border-b border-stone-700">
      {coverImage && (
        <div className="mb-8 md:mb-16">
          <CoverImage slug={slug} title={title} src={coverImage} />
        </div>
      )}
      <h3 className="text-4xl lg:text-5xl leading-tight text-stone-100">
        <Link href={`/posts/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <div className="mb-4 text-sm text-stone-400">
        {new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
      <p className="text-lg leading-relaxed mb-4 text-stone-300">{excerpt}</p>
    </section>
  );
};

export default HeroPost;
