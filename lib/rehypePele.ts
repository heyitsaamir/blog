import type { Element, Root } from "hast";
import { fromHtml } from "hast-util-from-html";
import { toString } from "hast-util-to-string";
import { render } from "pele";
import { visit } from "unist-util-visit";

function isMermaidCode(node: Element): boolean {
  const className = node.properties?.className;
  return (
    node.tagName === "code" &&
    Array.isArray(className) &&
    className.includes("language-mermaid")
  );
}

/**
 * Renders ```mermaid code blocks to inline SVG at build time using pele.
 * Colors come from the --pele-* CSS variables (see styles/index.css), so
 * light/dark switching needs no re-render and no client-side JS.
 */
export default function rehypePele() {
  return (tree: Root) => {
    let count = 0;

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return;
      const code = node.children.find(
        (child): child is Element => child.type === "element" && isMermaidCode(child)
      );
      if (!code) return;

      const source = toString(code);
      let replacement: Element;

      try {
        const { svg } = render(source, { idPrefix: `pele-${count++}` });
        replacement = {
          type: "element",
          tagName: "div",
          properties: { className: ["pele-diagram"] },
          children: fromHtml(svg, { fragment: true, space: "svg" }).children as Element["children"],
        };
      } catch (error) {
        // Fall back to showing the source so a bad diagram never breaks the post.
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[rehype-pele] Failed to render diagram: ${message}`);
        replacement = {
          type: "element",
          tagName: "pre",
          properties: { className: ["pele-error"], title: message },
          children: [{ type: "element", tagName: "code", properties: {}, children: [{ type: "text", value: source }] }],
        };
      }

      parent.children[index] = replacement;
      return "skip";
    });
  };
}
