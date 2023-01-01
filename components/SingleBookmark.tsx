import { Bookmark } from '../interfaces/bookmark';

export const SingleBookmark = ({ bookmark }: { bookmark: Bookmark }) => {
  return (
    <div className="flex flex-col">
      <div className="text-lg hover:underline font-bold">
        <a href={bookmark.link}>{bookmark.title}</a>
      </div>
      <div className="text-sm">{bookmark.excerpt}</div>
    </div>
  );
};
