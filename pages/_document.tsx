import { Html, Head, Main, NextScript } from "next/document";
import Script from 'next/script'
import Clarity from '@microsoft/clarity';
const projectId = "qyxlvb5uz3"

Clarity.init(projectId)

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <Script id="clarity-script">
                    {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "qyxlvb5uz3");`}
                </Script>
            </Head>
            <body className="bg-stone-50  dark:bg-stone-800 dark:text-stone-100">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
