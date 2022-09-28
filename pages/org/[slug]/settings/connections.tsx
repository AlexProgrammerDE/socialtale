import React from "react";
import {GetServerSideProps} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "pages/api/auth/[...nextauth]";
import prisma from "lib/prisma";
import {GlobalHead} from "components/GlobalHead";
import OrgLayout from "components/OrgLayout";
import {TwitterApi} from "twitter-api-v2";
import {useRouter} from "next/router";
import {createGoogleClient} from "lib/google-client";
import {google} from "googleapis";

type TwitterData = {
  userId: string;
  username: string;
}
type YouTubeData = {
  userId: string;
  channelName: string;
}
type ConnectionType = {}

type OrgConnectionsProps = {
  name: string;
  slug: string;
  twitter: TwitterData[];
  youtube: YouTubeData[];
  facebook: ConnectionType[];
  instagram: ConnectionType[];
  tiktok: ConnectionType[];
  pinterest: ConnectionType[];
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
          twitterAccounts: true,
          facebookAccounts: true,
          instagramAccounts: true,
          tiktokAccounts: true,
          pinterestAccounts: true,
          googleAccounts: true,
        }
      },
    }
  })

  const data: OrgConnectionsProps = {
    name: member.org.name,
    slug: member.org.slug,
    twitter: await Promise.all(member.org.twitterAccounts.map(async (account) => {
      const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: account.accessToken,
        accessSecret: account.accessTokenSecret,
      });
      return {
        userId: account.userId,
        username: (await client.currentUserV2()).data.username,
      }
    })),
    facebook: member.org.facebookAccounts,
    instagram: member.org.instagramAccounts,
    tiktok: member.org.tiktokAccounts,
    pinterest: member.org.pinterestAccounts,
    youtube: await Promise.all(member.org.googleAccounts.map(async (account) => {
      const client = createGoogleClient(member.org.id);
      client.setCredentials({access_token: account.accessToken, refresh_token: account.refreshToken});
      return {
        userId: account.userId,
        channelName: (await google.youtube('v3').channels.list({
          mine: true,
          auth: client,
          part: ['brandingSettings']
        })).data.items[0].brandingSettings.channel.title!,
      }
    })),
  }
  return {
    props: {
      ...data
    },
  };
};

const OrgConnections = (props: OrgConnectionsProps) => {
  const router = useRouter()

  return (
      <>
        <GlobalHead/>
        <OrgLayout orgName={props.name} slug={props.slug}
                   crumbs={[{name: "Settings", path: "/settings"}, {
                     name: "Connections",
                     path: "/settings/connections"
                   }]}>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold">Twitter</h2>
              {props.twitter.length > 0 &&
                  <ul className="list-disc ml-4">
                    {props.twitter.map((data, index) => <li key={index}>@{data.username}
                      {" "}
                      <a onClick={async () => {
                        await fetch(`/api/org/${props.slug}/twitter/unlink?userId=${data.userId}`)
                        router.reload()
                      }} className="link">Unlink</a>
                    </li>)}
                  </ul>
              }
              <div>
                <a href={`/api/org/${props.slug}/twitter/link`} className="btn">Connect Twitter</a>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold">YouTube</h2>
              {props.youtube.length > 0 &&
                  <ul className="list-disc ml-4">
                    {props.youtube.map((data, index) => <li key={index}>{data.channelName}
                      {" "}
                      <a onClick={async () => {
                        await fetch(`/api/org/${props.slug}/google/unlink?userId=${data.userId}`)
                        router.reload()
                      }} className="link">Unlink</a>
                    </li>)}
                  </ul>
              }
              <div>
                <a href={`/api/org/${props.slug}/google/link`} className="btn">Connect YouTube</a>
              </div>
            </div>
          </div>
        </OrgLayout>
      </>
  );
};

export default OrgConnections;
