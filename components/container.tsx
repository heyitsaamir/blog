type Props = {
  children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return <div className="container mx-auto bg-stone-900 dark:bg-stone-950 min-h-screen">{children}</div>;
};

export default Container;
