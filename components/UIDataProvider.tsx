import {createContext, ReactNode} from "react";
import {useSession} from "next-auth/react";
import useSWR from "swr";
import {UIData} from "lib/responses";

export const UIDataContext = createContext({
  user: null as unknown as UIData | undefined
});

export default function UIDataProvider({
                                         children
                                       }: {
  children: ReactNode;
}) {
  const {status} = useSession();
  const {
    data: user,
    error
  } = useSWR<UIData>(status === "authenticated" ? '/api/userdata' : null, {refreshInterval: 30000});

  return (
      <UIDataContext.Provider value={{user}}>
        {children}
      </UIDataContext.Provider>
  );
}
