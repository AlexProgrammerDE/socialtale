import Logo from "../public/logo.png";
import Image from "next/image";
import NavOptions from "./NavOptions";
import Link from "next/link";

export default function NavBar() {
  return (
      <div className="navbar w-full bg-base-300 z-10">
        <div className="container">
          <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-3" className="btn btn-ghost btn-square">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block h-6 w-6 stroke-current"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="mx-2 flex-1 px-2">
            <Link href="/">
              <a className="btn btn-ghost text-xl normal-case">
                <Image src={Logo} alt="PistonPost Logo" width={45} height={45}/>
                <p className="my-auto ml-2 text-xl font-bold">Socialtale</p>
              </a>
            </Link>
          </div>
          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal p-0 text-xl font-bold">
              <NavOptions/>
            </ul>
          </div>
        </div>
      </div>
  );
}
