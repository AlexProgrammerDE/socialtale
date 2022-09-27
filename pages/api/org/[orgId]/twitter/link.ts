import {TwitterApi} from "twitter-api-v2";
import {NextApiHandler} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from '../../../auth/[...nextauth]'
import prisma from "../../../../../lib/prisma";

const client = new TwitterApi({appKey: process.env.TWITTER_API_KEY, appSecret: process.env.TWITTER_API_SECRET});

const twitterHandler: NextApiHandler = async (req, res) => {
  const {orgId} = req.query
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({message: "You must be logged in."});
    return;
  }

  const authlink = await client.generateAuthLink(process.env.TWITTER_CALLBACK)

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

  await prisma.twitterFlow.create({
    data: {
      org: {
        connect: {
          id: Number(orgId),
        }
      },
      oauthToken: authlink.oauth_token,
      oauthTokenSecret: authlink.oauth_token_secret,
    },
  })

  res.redirect(authlink.url);
}
export default twitterHandler;
