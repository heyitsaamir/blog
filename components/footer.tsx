import Container from "./container";

const year = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="md:mx-20 md:mt-20 md:mb-8 bg-neutral-50 border-t border-neutral-200 dark:border-neutral-700 dark:bg-stone-800">
      <Container>
        <div className="py-4 flex flex-col items-center gap-y-2">
          <h3 className="text-sm font-light">Built sporadically in Seattle</h3>
          <div className="text-sm font-light">© {year} Aamir Jawaid</div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
