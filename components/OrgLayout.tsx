import {ReactNode} from "react";
import Layout from "./Layout";
import Link from "next/link";

type OrgLayoutProps = {
  children: ReactNode;
  orgName: string;
  slug: string;
  crumbs?: {
    name: string;
    path: string;
  }[];
}

export default function OrgLayout(props: OrgLayoutProps) {
  return (
      <Layout>
        <main className="container px-6">
          <div className="text-lg breadcrumbs">
            <ul>
              <li><Link href={`/org/${props.slug}`}><a>{props.orgName}</a></Link></li>
              {props.crumbs && props.crumbs.map((crumb) => (
                  <li key={crumb.name}><Link href={`/org/${props.slug}${crumb.path}`}><a>{crumb.name}</a></Link></li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap">
            <ul className="menu bg-base-200 w-56 p-2 rounded-box">
              <li className="menu-title">
                <span>Main</span>
              </li>
              <li><Link href={`/org/${props.slug}`}><a>Dashboard</a></Link></li>
              <li><Link href={`/org/${props.slug}/post`}><a>Post</a></Link></li>
              <li className="menu-title">
                <span>Settings</span>
              </li>
              <li><Link href={`/org/${props.slug}/settings`}><a>General</a></Link></li>
              <li><Link href={`/org/${props.slug}/settings/members`}><a>Members</a></Link></li>
              <li><Link href={`/org/${props.slug}/settings/connections`}><a>Connections</a></Link></li>
            </ul>
            <div className="flex-grow px-2">
              {props.children}
            </div>
          </div>
        </main>
      </Layout>
  );
}
