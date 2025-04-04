import Link, { LinkProps } from "next/link";
import { PropsWithChildren } from "react";

export const LinkButton = (
  props: PropsWithChildren<LinkProps & { className?: string }>,
) => {
  return (
    <Link
      {...props}
      className={`p-3 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-md transition-colors ${props.className}`}
    >
      {props.children}
    </Link>
  );
};
