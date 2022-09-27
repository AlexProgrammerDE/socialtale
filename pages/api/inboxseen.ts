import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from '../../lib/prisma'
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "./auth/[...nextauth]";

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

    for (const message of user.messages) {
      await prisma.message.update({
        where: {id: message.id},
        data: {seen: true}
      })
    }

    res.send('OK');
  }
}
