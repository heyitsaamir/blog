import { ISODate } from "./brand"

export interface Bookmark {
  excerpt: string
  note: string
  type: string
  tags: string[]
  _id: number
  title: string
  link: string
  created: ISODate
  lastUpdate: ISODate
}