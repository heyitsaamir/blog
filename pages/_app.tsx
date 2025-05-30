import { AppProps } from "next/app";
import { ThemeProvider } from "../components/ThemeProvider";
import "../styles/index.css";
import '../styles/prism-atom.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
