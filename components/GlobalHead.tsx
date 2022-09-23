import Head from "next/head";
import {color, description as brandDescription, title as brandTitle, twitter, url} from "../lib/branding";

export function GlobalHead({
                             title = brandTitle,
                             description = brandDescription,
                             noType = false,
                             noImage = false
                           }: {
  title?: string;
  description?: string;
  noType?: boolean;
  noImage?: boolean;
}) {
  const image = "/logo.png";

  return (
      <Head>
        <meta charSet="utf-8"/>

        <title>{title}</title>

        <link rel="manifest" href="/site.webmanifest"/>
        <link rel="shortcut icon" href="/favicon.ico"/>

        <meta name="format-detection" content="telephone=no"/>
        <meta name="mobile-web-app-capable" content="yes"/>

        <meta name="twitter:title" content={title}/>
        <meta property="og:title" content={title}/>

        <meta name="description" content={description}/>
        <meta name="twitter:description" content={description}/>
        <meta property="og:description" content={description}/>

        {!noType && <meta property="og:type" content="website"/>}
        <meta name="twitter:card" content="summary"/>

        <meta name="application-name" content={brandTitle}/>
        <meta property="og:site_name" content={brandTitle}/>
        <meta name="apple-mobile-web-app-title" content={brandTitle}/>
        <meta name="msapplication-tooltip" content={brandTitle}/>
        <meta name="apple-mobile-web-app-title" content={brandTitle}/>

        <meta name="msapplication-TileColor" content={color}/>
        <meta name="theme-color" content={color}/>
        <meta name="msapplication-navbutton-color" content={color}/>

        <meta name="twitter:url" content={url}/>
        <meta property="og:url" content={url}/>

        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png"/>
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color={color}/>
        <meta name="msapplication-TileImage" content="/favicons/mstile-144x144.png"/>

        <meta name="twitter:creator" content={twitter}/>

        {!noImage && (
            <>
              <meta property="og:image" content={image}/>
              <meta name="twitter:image" content={image}/>
            </>
        )}
      </Head>
  );
}
