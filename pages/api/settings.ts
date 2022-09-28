import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from 'lib/prisma'
import {UserSettings} from "lib/responses";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "pages/api/auth/[...nextauth]";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (session) {
    switch (req.method.toUpperCase()) {
      case 'GET':
        const user = await prisma.user.findUnique({
          where: {id: session.user.id},
        });
        const data: UserSettings = {
          name: user.name,
          email: user.email,
          emailNotifications: user.emailNotifications,
        };
        res.json(data);
        break
      case 'DELETE':
        await prisma.user.delete({
          where: {id: session.user.id},
        });
        res.send('OK')
        break
      case 'POST':
        await prisma.user.update({
          where: {id: session.user.id},
          data: {
            name: req.body.name,
            emailNotifications: req.body.emailNotifications,
            theme: req.body.theme,
          }
        })
        res.send('OK')
        break
    }
  }
}
