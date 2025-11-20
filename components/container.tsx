import { PropsWithChildren, ReactNode } from "react";

const Container = ({ children }: PropsWithChildren) => {
    return <div className="container mx-auto">{children as ReactNode}</div>;
};

export default Container;
