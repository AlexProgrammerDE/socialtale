import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import NavBar from "./NavBar";
import Drawer from "./Drawer";
import Footer from "./Footer";
import {UIDataContext} from "./UIDataProvider";

// noinspection JSUnusedLocalSymbols
export const Theme = createContext({
  theme: "dark",
  setTheme: (value: string) => {
  }
});

function setThemeTag(theme: string) {
  const themeTag = document.getElementById("documentBody")!;

  themeTag.setAttribute("data-theme", theme);
}

function getThemeTag() {
  const themeTag = document.getElementById("documentBody")!;

  return themeTag.getAttribute("data-theme")!;
}

export default function Layout({children}: { children: ReactNode }) {
  const [theme, setThemeState] = useState("placeholder");
  const {user} = useContext(UIDataContext);

  useEffect(() => {
    if (theme !== "placeholder") {
      setThemeTag(theme);
    } else {
      setThemeState(getThemeTag());
    }
  }, [theme]);

  const setTheme = useCallback(
      (value: string) => {
        setThemeState(value);
        setThemeTag(value);
        localStorage.setItem("theme", value);
      },
      [setThemeState]
  );

  useEffect(() => {
    if (user && user.theme) {
      setTheme(user.theme);
    }
  }, [user, setTheme]);

  return (
      <Theme.Provider value={{theme, setTheme}}>
        <div className="min-w-screen min-h-screen">
          <Drawer>
            <NavBar/>
            <div className="flex-grow">
              {children}
            </div>
            <Footer/>
          </Drawer>
        </div>
      </Theme.Provider>
  );
}
