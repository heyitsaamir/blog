type Props = {
  labels: string[];
};

const PostFooter = ({ labels }: Props) => {
  return (
    labels?.length
      ? (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-lg text-center">
            {labels.map((tag) => (
              <span
                key={tag}
                className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )
      : null
  );
};

export default PostFooter;
