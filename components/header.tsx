import Link from "next/link";

const Header = () => {
	return (
		<h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight pt-8 text-stone-900 dark:text-stone-100">
			<Link href="/" className="hover:underline underline-offset-[2.3px]">
				aamir j
			</Link>
			.
		</h2>
	);
};

export default Header;
