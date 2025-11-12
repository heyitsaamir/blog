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

interface DocumentValue {
  title: string;
  description?: string;
  publishedAt: string;
  publication: string;
  pages?: Array<{
    blocks?: Array<{
      block: {
        $type: string;
        plaintext?: string;
        level?: number;
      };
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
      
      switch (block.$type) {
        case "pub.leaflet.blocks.header":
          const level = block.level || 1;
          markdown += `${"#".repeat(level)} ${block.plaintext}\n\n`;
          break;
        case "pub.leaflet.blocks.text":
          markdown += `${block.plaintext}\n\n`;
          break;
        default:
          markdown += `${block.plaintext}\n\n`;
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