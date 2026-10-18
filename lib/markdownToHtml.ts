import rehypeFormat from "rehype-format";
import rehypePele from "./rehypePele";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
// import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export default async function markdownToHtml(markdown: string, theme?: 'dark' | 'light') {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    //.use(rehypeSanitize, {
    //  ...defaultSchema,
    //  attributes: {
    //    ...defaultSchema.attributes,
    //    "*": ["className"], // To allow diagram classes to continue to work
    //  },
    //})
    .use(rehypePele)
    .use(rehypePrismPlus, { ignoreMissing: true })
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}
