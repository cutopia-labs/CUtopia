import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
import { FC } from 'react';

const Document: FC = () => (
  <Html>
    <Head>
      <link rel="icon" href="/cutopia-logo.png" />
      <link rel="apple-touch-icon" href="/cutopia-logo.png" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href={`https://fonts.googleapis.com/css2?family=Pacifico&display=swap`}
        rel="stylesheet"
      />
    </Head>
    <body>
      <Main />
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-C85DMTM94G"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-C85DMTM94G');
        `}
      </Script>
      <NextScript />
    </body>
  </Html>
);

export default Document;
