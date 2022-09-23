import {NextApiHandler} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from '../../../auth/[...nextauth]'
import prisma from "../../../../../lib/prisma";
import {TwitterApi} from "twitter-api-v2";
import {PostPlatform} from "../../../../../lib/shared";

const twitterHandler: NextApiHandler = async (req, res) => {
  const {slug} = req.query;
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({message: "You must be logged in."});
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({message: "Method not allowed."});
    return;
  }

  const member = await prisma.organizationMember.findFirst({
    where: {
      org: {
        slug: slug as string,
      },
      OR: [
        {role: "OWNER"},
        {role: "ADMIN"},
        {role: "MEMBER"},
      ],
      member: {
        email: session.user.email
      }
    }
  })

  if (!member) {
    res.status(404).json({message: "Insufficient permissions."});
    return;
  }

  const platform: PostPlatform = req.body.platform;
  switch (platform) {
    case "twitter": {
      const {accessToken, accessTokenSecret} = await prisma.twitterOrgAccount.findFirst({
        where: {
          org: {
            slug: slug as string,
          },
          userId: req.body.userId,
        },
      })

      if (!accessToken || !accessTokenSecret) {
        res.status(404).json({message: "Twitter account not found."});
        return;
      }

      const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken,
        accessSecret: accessTokenSecret,
      });

      const postTweet = await client.v2.tweet({
        text: req.body.content,
      });

      res.json({message: "Success!"});
      break
    }
    default: {
      res.status(404).json({message: "Platform not found."});
    }
  }
}
export default twitterHandler;
