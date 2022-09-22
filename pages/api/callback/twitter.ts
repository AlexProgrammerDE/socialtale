import {TwitterApi} from "twitter-api-v2";
import {NextApiHandler} from "next";
import prisma from "../../../lib/prisma";

const twitterHandler: NextApiHandler = async (req, res) => {
  const {oauth_token, oauth_verifier} = req.query;

  const twitterFlow = !!oauth_token ? await prisma.twitterFlow.findUnique({
    where: {
      oauthToken: oauth_token as string
    },
    include: {
      org: true
    }
  }) : undefined;

  if (!oauth_token || !oauth_verifier || !twitterFlow) {
    return res.status(400).send('You denied the app or your session expired!');
  }

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: oauth_token as string,
    accessSecret: twitterFlow.oauthTokenSecret,
  });

  client.login(oauth_verifier as string)
      .then(async ({client: loggedClient, accessToken, accessSecret}) => {
        await prisma.twitterFlow.delete({
          where: {
            oauthToken: oauth_token as string
          }
        })
        const data = await loggedClient.currentUserV2()

        await prisma.twitterOrgAccount.create({
          data: {
            userId: data.data.id,
            orgId: twitterFlow.orgId,
            accessToken: accessToken,
            accessTokenSecret: accessSecret,
          }
        })

        res.redirect(`/org/${twitterFlow.org.slug}/settings/connections`);
      })
      .catch(() => res.status(403).send('Invalid verifier or access tokens!'));
}
export default twitterHandler;
