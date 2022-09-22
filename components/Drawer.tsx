import {ReactNode} from "react";
import NavOptions from "./NavOptions";

export default function Drawer({children}: { children: ReactNode }) {
  return (
      <div className="drawer">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle"/>
        <div className="drawer-content flex flex-col">{children}</div>
        <div className="drawer-side">
          <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
          <ul className="menu w-80 overflow-y-auto bg-base-100 p-4 text-xl font-bold">
            <NavOptions/>
          </ul>
        </div>
      </div>
  );
}
