import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class AzariaDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
          <meta name="theme-color" content="#0a0a0f" />
          <meta name="description" content="Azaria AI Agency — Enterprise MCP infrastructure, AI automation, and serverless edge computing." />
          <meta property="og:title" content="Azaria AI Agency" />
          <meta property="og:description" content="Enterprise MCP infrastructure and AI automation." />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
