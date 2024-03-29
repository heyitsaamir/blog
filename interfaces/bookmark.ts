import { BrandedNumber, ISODate, Url } from "./brand";

export type BookmarkId = BrandedNumber<"BookmarkId">;

export interface Bookmark {
  excerpt: string;
  note: string;
  type: string;
  tags: string[];
  _id: BookmarkId;
  title: string;
  link: Url;
  created: ISODate;
  lastUpdate: ISODate;
}
