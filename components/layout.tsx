import Head from "next/head";
import Container from "./container";
import Footer from "./footer";
import Header from "./header";
import Meta from "./meta";
import ThemeToggle from "./ThemeToggle";

type Props = {
  preview?: boolean;
  children: React.ReactNode;
  head?: React.ReactNode;
  isIndexPage?: boolean;
  meta?: {
    title?: string;
    description?: string;
    ogImage?: string;
    ogType?: "website" | "article";
    canonicalUrl?: string;
    publishedTime?: string;
    modifiedTime?: string;
    tags?: string[];
  };
};

const Layout = ({ children, head, isIndexPage, meta }: Props) => {
  return (
    <>
      <Meta {...meta} />
      {head && <Head>{head}</Head>}
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex flex-col gap-8">
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>
        <main>
          <Container>
            <div className={isIndexPage ? 'md:mx-48 py-8' : ""}>
              <Header />
            </div>
            {children}
          </Container>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
