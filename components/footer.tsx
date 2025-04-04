import Container from "./container";

const year = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="md:mx-20 md:mt-20 md:mb-8 bg-stone-800 border-t border-stone-700">
      <Container>
        <div className="py-4 flex flex-col items-center gap-y-2">
          <h3 className="text-sm font-light text-stone-300">Built sporadically in Seattle</h3>
          <div className="text-sm font-light text-stone-300">© {year} Aamir Jawaid</div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
