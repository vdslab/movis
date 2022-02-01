import { CacheProvider, EmotionCache } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import Router from "next/router";
import nprogress from "nprogress"; //nprogress module
import { Provider } from "react-redux";

import { Layout } from "@/components/Layout";
import { APP_BASE_URL } from "@/env";
import { store } from "@/modules/store";
import createEmotionCache from "@/styles/createEmotionCache";
import theme from "@/styles/theme";

import "nprogress/nprogress.css"; //styles of nprogress
import "../styles/nprogress.css";
//Binding events.
Router.events.on("routeChangeStart", () => nprogress.start());
Router.events.on("routeChangeComplete", () => nprogress.done());
Router.events.on("routeChangeError", () => nprogress.done());

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps): JSX.Element {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const title = "movis";
  const description =
    "movis は「人」から映画を探すことができる映画検索サービスです。おすすめに見たい映画がない場合には movis で好きな俳優や監督から映画を探しましょう。";
  const url = APP_BASE_URL;
  const ogImgUrl = `${APP_BASE_URL}/images/ogp.png`;
  const ogImgAlt = "映画フィルムをあしらった movis のアイキャッチ";

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Provider store={store}>
          <DefaultSeo
            title={title}
            description={description}
            openGraph={{
              type: "website",
              locale: "ja_JP",
              site_name: title,
              title: title,
              description: description,
              url: url,
              images: [
                {
                  width: 1200,
                  height: 630,
                  url: ogImgUrl,
                  alt: ogImgAlt,
                  type: "image/png",
                },
              ],
            }}
            twitter={{
              cardType: "summary_large_image",
            }}
          />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Provider>
      </ThemeProvider>
    </CacheProvider>
  );
}
