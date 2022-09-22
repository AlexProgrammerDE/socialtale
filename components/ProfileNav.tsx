import {signIn, signOut, useSession} from "next-auth/react";
import Image from "next/image";
import {useContext} from "react";
import Link from "next/link";
import {UIDataContext} from "./UIDataProvider";

export default function ProfileNav() {
  const {status} = useSession();
  const {user} = useContext(UIDataContext);

  if (status === "loading" || (status === "authenticated" && !user)) {
    return (
        <li tabIndex={0}>
          <a className="mx-1 flex flex-row">
            <span>Loading</span>
          </a>
        </li>
    );
  }

  if (user) {
    return (
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <Image
                  width={80}
                  height={80}
                  className="rounded-full"
                  src={user.avatar}
                  alt={`Avatar of ${user.name}`}
              />
            </div>
          </label>
          <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-200 rounded-box">
            <li>
              <Link href="/inbox">
                <a className="justify-between w-full">
                  Inbox
                  <span className="badge badge-primary">{user.inboxCount}</span>
                </a>
              </Link>
            </li>
            <li><Link href="/account/settings"><a className="w-full">Settings</a></Link></li>
            <li><a className="w-full" onClick={() => signOut()}>Logout</a></li>
          </ul>
        </div>
    );
  } else {
    return (
        <li>
          <a className="mx-1" onClick={() => signIn()}>
            Sign in
          </a>
        </li>
    );
  }
}
