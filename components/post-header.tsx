import Avatar from "./avatar";
import DateFormatter from "./date-formatter";
import CoverImage from "./cover-image";
import PostTitle from "./post-title";
import type Author from "../interfaces/author";

type Props = {
  title: string;
  coverImage?: string;
  date: string;
  labels?: string[];
};

const PostHeader = ({ title, coverImage, date, labels }: Props) => {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      {coverImage && (
        <div className="mb-8 md:mb-16 sm:mx-0">
          <CoverImage title={title} src={coverImage} />
        </div>
      )}
      {labels?.length
        ? (
          <div className="mb-6 text-center">
            {labels.map((tag) => (
              <span
                key={tag}
                className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )
        : null}
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-lg text-center">
          <DateFormatter dateString={date} />
        </div>
      </div>
    </>
  );
};

export default PostHeader;
