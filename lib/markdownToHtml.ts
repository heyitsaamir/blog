import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeMermaid from "rehype-mermaid";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { unified } from "unified";

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        "*": ["className"], // To allow mermaid classes to continue to work
      },
    })
    .use(rehypeMermaid, { strategy: "pre-mermaid" })
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}
