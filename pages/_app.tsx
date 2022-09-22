import {SessionProvider} from "next-auth/react";
import {AppProps} from "next/app";
import '../styles/global.css'
import '@sweetalert2/theme-dark/dark.css';
import UIDataProvider from "../components/UIDataProvider";
import {SWRConfig} from "swr";

const App = ({Component, pageProps: {session, ...pageProps}}: AppProps) => {
  return (
      <SWRConfig value={{fetcher: url => fetch(url).then(res => res.json())}}>
        <SessionProvider session={session}>
          <UIDataProvider>
            <Component {...pageProps} />
          </UIDataProvider>
        </SessionProvider>
      </SWRConfig>
  );
};

export default App;
