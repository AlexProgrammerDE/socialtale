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
        <body id="documentBody">
        <script dangerouslySetInnerHTML={{__html: themeInitializerScript}}/>
        <Main/>
        <NextScript/>
        </body>
      </Html>
  );
}
