import createEmotionServer from "@emotion/server/create-instance";
import { RenderPageResult } from "next/dist/shared/lib/utils";
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentInitialProps,
} from "next/document";
import React from "react";

import createEmotionCache from "@/styles/createEmotionCache";

const title = "movis";
const description =
  "movis は「人」から映画を探すことができる映画検索サービスです。おすすめに見たい映画がない場合には movis で好きな俳優や監督から映画を探しましょう。";

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html lang="ja">
        <Head>
          {/* PWA primary color */}
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="icons/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="icons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="icons/favicon-16x16.png"
          />
          <link rel="manifest" href="icons/site.webmanifest" />
          <link
            rel="mask-icon"
            href="icons/safari-pinned-tab.svg"
            color="#022c43"
          />
          <link rel="shortcut icon" href="icons/favicon.ico" />
          <meta name="apple-mobile-web-app-title" content="movis" />
          <meta name="application-name" content="movis" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-config" content="icons/browserconfig.xml" />
          <meta name="theme-color" content="#022c43" />

          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:site_name" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content="%PUBLIC_URL%" />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="%PUBLIC_URL%/ogp.png" />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async (ctx): Promise<DocumentInitialProps> => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = ctx.renderPage;

  // You can consider sharing the same emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = (): RenderPageResult | Promise<RenderPageResult> =>
    originalRenderPage({
      enhanceApp:
        (App: any) =>
        // eslint-disable-next-line react/display-name
        (props): JSX.Element =>
          <App emotionCache={cache} {...props} />,
    });

  const initialProps = await Document.getInitialProps(ctx);
  // This is important. It prevents emotion to render invalid HTML.
  // See https://github.com/mui-org/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      ...React.Children.toArray(initialProps.styles),
      ...emotionStyleTags,
    ],
  };
};
