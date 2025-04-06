type Props = {
  children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return <div className="container mx-auto bg-stone-900 dark:bg-stone-950">{children}</div>;
};

export default Container;
