import Container from "../components/container";
import Header from "../components/header";
import Layout from "../components/layout";
import { getRaindrops } from "../lib/raindrop";
import type { Bookmark } from "../interfaces/bookmark";
import { SingleBookmark } from "../components/SingleBookmark";

type Props = {
  bookmarks: Bookmark[];
};

export const revalidate = 3600; // revalidate every hour

export default function Bookmarks({ bookmarks }: Props) {
  return (
    <Layout>
      <Container>
        <Header />
        <h2 className="mb-8 text-6xl font-bold text-center">Bookmarks</h2>
        <ul className="flex flex-col px-20">
          {bookmarks.map((bookmark) => {
            return (
              <li
                key={bookmark._id}
                className="p-4 border-b-2 border-b-stone-500 last:border-none"
              >
                <SingleBookmark bookmark={bookmark} />
              </li>
            );
          })}
        </ul>
      </Container>
    </Layout>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const bookmarks = await getRaindrops();

  return {
    props: {
      bookmarks,
    },
  };
}
