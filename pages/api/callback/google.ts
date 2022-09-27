import {NextApiHandler} from "next";
import prisma from "../../../lib/prisma";
import {createGoogleClient} from "../../../lib/google-client";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]";
import {google} from "googleapis";

const googleHandler: NextApiHandler = async (req, res) => {
  const {code} = req.query;
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!code) {
    return res.status(400).send('You denied the app or your session expired!');
  }

  const currentFlow = await prisma.googleFlow.findFirst({
    where: {
      userId: session.user.id
    },
    include: {
      org: true
    }
  })

  if (!currentFlow) {
    return res.status(400).send('Your session expired!');
  }

  const client = createGoogleClient(currentFlow.org.id);
  const {tokens} = await client.getToken(code as string)
  client.setCredentials(tokens);

  await prisma.googleFlow.delete({
    where: {
      userId: currentFlow.userId
    }
  })

  const ownChannel = await google.youtube('v3').channels.list({
    auth: client,
    mine: true,
    part: ['id']
  })
  await prisma.googleOrgAccount.create({
    data: {
      userId: ownChannel.data.items[0].id,
      orgId: currentFlow.orgId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    }
  })

  res.redirect(`/org/${currentFlow.org.slug}/settings/connections`);
}
export default googleHandler;
