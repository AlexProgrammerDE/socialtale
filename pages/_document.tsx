import {Head, Html, Main, NextScript} from "next/document";

const themeInitializerScript = `
       (function () {
         const theme = window.localStorage.getItem("theme") || "dark";
         document.getElementById('documentBody').setAttribute('data-theme', theme);
       })();
   `;

export default function Document() {
  // noinspection HtmlRequiredTitleElement
  return (
      <Html>
        <Head/>
        <body id="documentBody">
        <script dangerouslySetInnerHTML={{__html: themeInitializerScript}}/>
        <Main/>
        <NextScript/>
        </body>
      </Html>
  );
}
