import grayMatter from "gray-matter";
import slugify from "slugify";
import type PostType from "../interfaces/post";

export const ATPROTO_CONFIG = {
  DID: "did:plc:43q2jbg6hl2lv23l53x53ma3",
  PDS_URL: "https://scarletina.us-east.host.bsky.network",
  CDN_URL: "https://cdn.bsky.app",
};

export const ATPROTO_COLLECTIONS = {
  PUBLICATION: "pub.leaflet.publication",
  DOCUMENT: "pub.leaflet.document",
};

interface ATProtocolRecord<T = unknown> {
  uri: string;
  cid: string;
  value: T;
}

interface RichTextFacet {
  index: {
    byteStart: number;
    byteEnd: number;
  };
  features: Array<{
    $type: string;
    uri?: string;
  }>;
}

interface LeafletBlock {
  $type: string;
  plaintext?: string;
  level?: number;
  facets?: RichTextFacet[];
}

interface DocumentValue {
  title: string;
  description?: string;
  publishedAt: string;
  publication: string;
  pages?: Array<{
    blocks?: Array<{
      block: LeafletBlock;
    }>;
  }>;
}

interface PublicationValue {
  name: string;
  description?: string;
  base_path?: string;
}

interface ListRecordsResponse {
  records: ATProtocolRecord[];
  cursor?: string;
}

const fetchWrapper = async (...args: Parameters<typeof fetch>) => {
  const [url, options] = args;
  return await fetch(url, {
    ...options,
    next: { revalidate: 3600 }, // revalidate every hour
  });
};

async function fetchATProtocolRecords(
  collection: string,
  cursor?: string
): Promise<ListRecordsResponse> {
  const url = new URL(`${ATPROTO_CONFIG.PDS_URL}/xrpc/com.atproto.repo.listRecords`);
  url.searchParams.set("repo", ATPROTO_CONFIG.DID);
  url.searchParams.set("collection", collection);
  if (cursor) {
    url.searchParams.set("cursor", cursor);
  }

  const response = await fetchWrapper(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch records: ${response.statusText}`);
  }

  return response.json();
}

export async function getAllLeafletPosts(): Promise<PostType[]> {
  try {
    // Fetch publications first to get metadata
    const publicationsResponse = await fetchATProtocolRecords(
      ATPROTO_COLLECTIONS.PUBLICATION
    );
    const publications = new Map<string, PublicationValue>();
    
    publicationsResponse.records.forEach((record) => {
      const publication = record.value as PublicationValue;
      publications.set(record.uri, publication);
    });

    // Fetch documents
    const documentsResponse = await fetchATProtocolRecords(
      ATPROTO_COLLECTIONS.DOCUMENT
    );


    const posts: PostType[] = documentsResponse.records
      .map((record) => {
        const document = record.value as DocumentValue;
        const publication = publications.get(document.publication);

        return parseLeafletDocument(record, document, publication);
      })
      .filter((post): post is PostType => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
  } catch (error) {
    console.log(
      `Error getting Leaflet posts: ${error instanceof Error ? error.message : ""}`
    );
    return [];
  }
}

export async function getLeafletPostBySlug(slug: string): Promise<PostType | null> {
  try {
    const posts = await getAllLeafletPosts();
    return posts.find((post) => post.slug === slug) || null;
  } catch (error) {
    console.log(
      `Error getting Leaflet post by slug: ${error instanceof Error ? error.message : ""}`
    );
    return null;
  }
}

function applyRichTextFormatting(text: string, facets?: RichTextFacet[]): string {
  if (!facets || facets.length === 0) {
    return text;
  }

  // Convert string to UTF-8 bytes for proper offset handling
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const bytes = encoder.encode(text);

  // Sort facets by start position (descending) to apply from end to start
  const sortedFacets = [...facets].sort((a, b) => b.index.byteStart - a.index.byteStart);

  let result = text;

  for (const facet of sortedFacets) {
    const { byteStart, byteEnd } = facet.index;

    // Extract the portion to format using byte offsets
    const beforeBytes = bytes.slice(0, byteStart);
    const targetBytes = bytes.slice(byteStart, byteEnd);
    const afterBytes = bytes.slice(byteEnd);

    const before = decoder.decode(beforeBytes);
    const target = decoder.decode(targetBytes);
    const after = decoder.decode(afterBytes);

    // Apply formatting based on feature types
    let formatted = target;
    for (const feature of facet.features) {
      switch (feature.$type) {
        case 'pub.leaflet.richtext.facet#link':
          if (feature.uri) {
            formatted = `[${formatted}](${feature.uri})`;
          }
          break;
        case 'pub.leaflet.richtext.facet#bold':
          formatted = `**${formatted}**`;
          break;
        case 'pub.leaflet.richtext.facet#italic':
          formatted = `*${formatted}*`;
          break;
        case 'pub.leaflet.richtext.facet#strikethrough':
          formatted = `~~${formatted}~~`;
          break;
        case 'pub.leaflet.richtext.facet#code':
          formatted = `\`${formatted}\``;
          break;
      }
    }

    result = before + formatted + after;
  }

  return result;
}

function convertLeafletToMarkdown(document: DocumentValue): string {
  if (!document.pages || document.pages.length === 0) {
    return "";
  }

  let markdown = "";

  for (const page of document.pages) {
    if (!page.blocks) continue;

    for (const blockWrapper of page.blocks) {
      const block = blockWrapper.block;

      if (!block.plaintext) continue;

      // Apply rich text formatting
      const formattedText = applyRichTextFormatting(block.plaintext, block.facets);

      switch (block.$type) {
        case "pub.leaflet.blocks.header":
          const level = block.level || 1;
          markdown += `${"#".repeat(level)} ${formattedText}\n\n`;
          break;
        case "pub.leaflet.blocks.blockquote":
          markdown += `> ${formattedText}\n\n`;
          break;
        case "pub.leaflet.blocks.code":
          markdown += `\`\`\`\n${block.plaintext}\n\`\`\`\n\n`;
          break;
        case "pub.leaflet.blocks.orderedList":
        case "pub.leaflet.blocks.unorderedList":
          // Lists are typically handled as separate items
          markdown += `- ${formattedText}\n`;
          break;
        case "pub.leaflet.blocks.horizontalRule":
          markdown += `---\n\n`;
          break;
        case "pub.leaflet.blocks.text":
          markdown += `${formattedText}\n\n`;
          break;
        default:
          // Fallback for unknown block types
          markdown += `${formattedText}\n\n`;
          break;
      }
    }
  }

  return markdown.trim();
}

function constructLeafletUrl(record: ATProtocolRecord, publication?: PublicationValue): string {
  if (!publication?.base_path) {
    return record.uri;
  }
  
  // Extract document ID from the URI (e.g., "3m5fdiqs2ic2i" from "at://did:plc:43q2jbg6hl2lv23l53x53ma3/pub.leaflet.document/3m5fdiqs2ic2i")
  const documentId = record.uri.split('/').pop();
  return `https://${publication.base_path}/${documentId}`;
}

function parseLeafletDocument(
  record: ATProtocolRecord,
  document: DocumentValue,
  publication?: PublicationValue
): PostType | null {
  if (!document.title || !document.publishedAt) {
    return null;
  }

  const content = convertLeafletToMarkdown(document);
  const data = grayMatter(content);
  
  const title = document.title;
  const slug = data.data?.slug || slugify(title, { lower: true, strict: true });
  const date = data.data?.date || document.publishedAt;
  const excerpt = data.data?.excerpt || document.description || "";
  const labels = publication?.name ? [publication.name].filter(Boolean) : [];
  const leafletUrl = constructLeafletUrl(record, publication);

  return {
    content: data.content || content,
    title,
    slug,
    date,
    excerpt,
    labels,
    isDraft: false,
    source: 'leaflet',
    sourceUri: leafletUrl,
  };
}