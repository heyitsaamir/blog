import Link from 'next/link';

const Intro = () => {
  return (
    <section className="flex-row items-center md:justify-between pt-16 pb-16 pd:pb-12">
      <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight pd:pr-8 text-center">
        aamir j.
      </h1>
      <div className="flex flex-row gap-4 justify-center">
        <Link href="/posts">More Posts</Link>
      </div>
    </section>
  );
};

export default Intro;
