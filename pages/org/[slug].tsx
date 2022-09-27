import React from "react";
import {GetServerSideProps} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../api/auth/[...nextauth]";
import prisma from "../../lib/prisma";
import gravatar from "gravatar";
import {GlobalHead} from "../../components/GlobalHead";
import Masonry from "react-masonry-css";
import {breakpointColumnsObj} from "../../lib/shared";
import OrgLayout from "../../components/OrgLayout";

type OrgDashboardProps = {
  name: string;
  slug: string;
  members: {
    name: string;
    avatar: string;
    role: string;
  }[];
}

export const getServerSideProps: GetServerSideProps = async ({req, res, params}) => {
  const session = await unstable_getServerSession(req, res, authOptions)
  const {slug} = params;

  const member = await prisma.organizationMember.findFirst({
    where: {
      memberId: session.user.id,
      org: {
        slug: slug as string,
      }
    },
    include: {
      org: {
        include: {
          members: {
            include: {
              member: true
            }
          }
        }
      },
    }
  })

  const data: OrgDashboardProps = {
    name: member.org.name,
    slug: member.org.slug,
    members: member.org.members.map((member) => ({
      name: member.member.name,
      avatar: gravatar.url(member.member.email, {d: "retro"}, true),
      role: member.role,
    })),
  }
  return {
    props: {
      ...data
    },
  };
};

const OrgDashboard = (props: OrgDashboardProps) => {
  return (
      <>
        <GlobalHead/>
        <OrgLayout orgName={props.name} slug={props.slug} crumbs={[{name: "Dashboard", path: ""}]}>
          <Masonry
              breakpointCols={breakpointColumnsObj}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
          >
            {props.members.map((member) => (
                <div key={member.name} className="card md:card-normal card-compact md:w-96 bg-base-200 shadow-lg">
                  <div className="card-body justify-between">
                    <h2 className="break-text card-title place-items-start flex-col">
                      Name: {member.name} Role: {member.role}
                    </h2>
                  </div>
                </div>
            ))}
          </Masonry>
        </OrgLayout>
      </>
  );
};

export default OrgDashboard;
