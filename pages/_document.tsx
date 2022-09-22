import {Head, Html, Main, NextScript} from "next/document";
import {twitter} from "../lib/branding";

const themeInitializerScript = `
       (function () {
         const theme = window.localStorage.getItem("theme") || "dark";
         document.getElementById('documentBody').setAttribute('data-theme', theme);
       })();
   `;

export default function Document() {
  return (
      <Html>
        <Head>
          <meta charSet="utf-8"/>

          <meta name="format-detection" content="telephone=no"/>

          <meta name="format-detection" content="telephone=no"/>
          <meta name="mobile-web-app-capable" content="yes"/>

          <meta name="msapplication-tap-highlight" content="no"/>

          <meta name="apple-mobile-web-app-capable" content="yes"/>
          <meta name="apple-mobile-web-app-status-bar-style" content="default"/>

          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>
          <link
              rel="apple-touch-icon"
              href="/icons/apple-touch-icon-57x57.png"
              sizes="57x57"
          />
          <link
              rel="apple-touch-icon"
              href="/icons/apple-touch-icon-60x60.png"
              sizes="60x60"
          />
          <link
              rel="apple-touch-icon"
              href="/icons/apple-touch-icon-72x72.png"
              sizes="72x72"
          />
          <link
              rel="apple-touch-icon"
              href="/icons/apple-touch-icon-76x76.png"
              sizes="76x76"
          />
          <link
              rel="apple-touch-icon"
              href="/icons/apple-touch-icon-114x114.png"
              sizes="114x114"
          />
          <link
              rel="apple-touch-icon"
              href="/icons/apple-touch-icon-120x120.png"
              sizes="120x120"
          />
          <link
              rel="apple-touch-icon"
              href="/icons/apple-touch-icon-128x128.png"
              sizes="128x128"
          />
          <link
              rel="apple-touch-icon"
              href="/icons/apple-touch-icon-144x144.png"
              sizes="144x144"
          />
          <link
              rel="apple-touch-icon"
              href="/icons/apple-touch-icon-152x152.png"
              sizes="152x152"
          />
          <link
              rel="apple-touch-icon"
              href="/icons/apple-touch-icon-180x180.png"
              sizes="180x180"
          />
          <link
              rel="apple-touch-icon"
              href="/icons/apple-touch-icon-precomposed.png"
          />
          <meta
              name="msapplication-TileImage"
              content="/_icons/win8-tile-144x144.png"
          />

          <meta
              name="msapplication-square70x70logo"
              content="/icons/win8-tile-70x70.png"
          />
          <meta
              name="msapplication-square144x144logo"
              content="/icons/win8-tile-144x144.png"
          />
          <meta
              name="msapplication-square150x150logo"
              content="/icons/win8-tile-150x150.png"
          />
          <meta
              name="msapplication-wide310x150logo"
              content="/icons/win8-tile-310x150.png"
          />
          <meta
              name="msapplication-square310x310logo"
              content="/icons/win8-tile-310x310.png"
          />

          <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/icons/favicon-32x32.png"
          />
          <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/icons/favicon-16x16.png"
          />
          <link rel="manifest" href="/manifest.json"/>
          <link rel="shortcut icon" href="/favicon.ico"/>

          <meta name="twitter:card" content="summary"/>
          <meta property="og:type" content="website"/>
          <meta name="twitter:creator" content={twitter}/>
        </Head>
        <body id="documentBody">
        <script dangerouslySetInnerHTML={{__html: themeInitializerScript}}/>
        <Main/>
        <NextScript/>
        </body>
      </Html>
  );
}
