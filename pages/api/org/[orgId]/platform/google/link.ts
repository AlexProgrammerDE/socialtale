import {NextApiHandler} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "pages/api/auth/[...nextauth]";
import prisma from "lib/prisma";
import {createGoogleClient} from "lib/google-client";

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtubepartner',
  'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtubepartner-channel-audit',
];

const authlink = createGoogleClient().generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as a string
  scope: scopes,

  redirect_uri: process.env.GOOGLE_CALLBACK,

  include_granted_scopes: true,
})

const twitterHandler: NextApiHandler = async (req, res) => {
  const {orgId} = req.query;
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({message: "You must be logged in."});
    return;
  }

  const member = await prisma.organizationMember.findFirst({
    where: {
      orgId: Number(orgId),
      OR: [
        {role: "OWNER"},
        {role: "ADMIN"},
      ],
      member: {
        id: session.user.id
      }
    }
  })

  if (!member) {
    res.status(404).json({message: "Insufficient permissions."});
    return;
  }

  const currentFlow = await prisma.googleFlow.findFirst({
    where: {
      userId: member.memberId,
    }
  })

  if (currentFlow !== null) {
    await prisma.googleFlow.delete({
      where: {
        userId: member.memberId
      }
    })
  }

  await prisma.googleFlow.create({
    data: {
      orgId: member.orgId,
      userId: member.memberId,
    },
  })

  res.redirect(authlink);
}
export default twitterHandler;
