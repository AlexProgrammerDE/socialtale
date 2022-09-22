import React from "react";
import {GlobalHead} from "../components/GlobalHead";
import Layout from "../components/Layout";
import prisma from "../lib/prisma";
import {GetServerSideProps} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "./api/auth/[...nextauth]";
import {breakpointColumnsObj} from "../lib/shared";
import Masonry from "react-masonry-css";
import Link from "next/link";

type Organisation = {
  id: number;
  name: string;
  slug: string;
}

type DashboardProps = {
  orgs: Organisation[];
}

const CreateOrg = (props: DashboardProps) => {
  return (
      <>
        <GlobalHead/>
        <Layout>
          <main className="container flex-grow p-2">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
              {props.orgs.map((org) => (
                  <Link key={org.id} href={"/org/" + org.slug}>
                    <a>
                      <div className="card md:card-normal card-compact m-2 md:w-96 bg-base-200 shadow-lg">
                        <div className="card-body justify-between">
                          <h2 className="break-text card-title place-items-start flex-col">
                            {org.name}
                          </h2>
                        </div>
                      </div>
                    </a>
                  </Link>
              ))}
            </Masonry>
          </main>
        </Layout>
      </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const members = await prisma.organizationMember.findMany({
    where: {
      member: {
        email: session.user.email
      }
    },
    include: {
      org: true
    }
  })

  if (members.length === 0) {
    return {
      redirect: {
        destination: '/org/create',
        permanent: false,
      },
    }
  }

  const data: DashboardProps = {
    orgs: members.map((member) => member.org).map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug
    })),
  }

  return {
    props: {
      ...data
    }
  }
}

// noinspection JSUnusedGlobalSymbols
export default CreateOrg;
