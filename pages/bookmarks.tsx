import Container from '../components/container';
import Header from '../components/header';
import Layout from '../components/layout';
import { getRaindrops } from '../lib/raindrop';
import type { Bookmark } from '../interfaces/bookmark';
import { SingleBookmark } from '../components/SingleBookmark';

type Props = {
  bookmarks: Bookmark[];
};

export default function Bookmarks({ bookmarks }: Props) {
  return (
    <Layout>
      <Container>
        <Header />
        <h2 className="text-6xl font-bold text-center">Bookmarks</h2>
        <ul className="flex flex-col gap-8">
          {bookmarks.map((bookmark) => {
            return (
              <li key={bookmark._id}>
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
