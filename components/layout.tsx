import Footer from "./footer";
import Meta from "./meta";
import ThemeToggle from "./ThemeToggle";

type Props = {
  preview?: boolean;
  children: React.ReactNode;
};

const Layout = ({ preview, children }: Props) => {
  return (
    <>
      <Meta />
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex flex-col gap-8">
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
