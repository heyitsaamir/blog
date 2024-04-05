import Link, { LinkProps } from "next/link";
import { PropsWithChildren } from "react";

export const LinkButton = (
  props: PropsWithChildren<LinkProps & { className?: string }>,
) => {
  return (
    <Link
      {...props}
      className={`p-2 bg-stone-500 hover:underline rounded-md ${props.className}`}
    >
      {props.children}
    </Link>
  );
};
