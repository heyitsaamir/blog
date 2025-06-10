import rehypeFormat from "rehype-format";
import rehypeMermaid from "rehype-mermaid";
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
    .use(require('remark-prism'))
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    //.use(rehypeSanitize, {
    //  ...defaultSchema,
    //  attributes: {
    //    ...defaultSchema.attributes,
    //    "*": ["className"], // To allow mermaid classes to continue to work
    //  },
    //})
    .use(rehypeMermaid, {
      strategy: "pre-mermaid"
    })
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}
