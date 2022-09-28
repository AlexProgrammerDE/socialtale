import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from 'lib/prisma'
import {UIData} from "lib/responses";
import gravatar from 'gravatar'
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "pages/api/auth/[...nextauth]";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (session) {
    const user = await prisma.user.findUnique({
      where: {id: session.user.id},
      include: {
        messages: {
          where: {
            seen: false
          }
        },
      }
    });
    const data: UIData = {
      name: user.name,
      avatar: gravatar.url(user.email, {d: 'retro'}, true),
      theme: user.theme.toLowerCase(),
      inboxCount: user.messages.length,
    };
    res.json(data);
  }
}
