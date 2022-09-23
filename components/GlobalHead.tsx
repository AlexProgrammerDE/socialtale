import Head from "next/head";
import {color, description as brandDescription, title as brandTitle, url} from "../lib/branding";

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
  const image = "/logo.webp";

  return (
      <Head>
        <title>{title}</title>
        <meta name="twitter:title" content={title}/>
        <meta property="og:title" content={title}/>

        <meta name="description" content={description}/>
        <meta name="twitter:description" content={description}/>
        <meta property="og:description" content={description}/>

        {!noType && <meta property="og:type" content="website"/>}

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
        <link rel="manifest" href="/site.webmanifest"/>
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#f15143"/>
        <meta name="msapplication-TileColor" content={color}/>
        <meta name="msapplication-TileImage" content="/favicons/mstile-144x144.png"/>

        {!noImage && (
            <>
              <meta property="og:image" content={image}/>
              <meta name="twitter:card" content="summary" />
              <meta name="twitter:image" content={image}/>
            </>
        )}
      </Head>
  );
}
