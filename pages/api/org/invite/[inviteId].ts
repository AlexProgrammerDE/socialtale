import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from 'lib/prisma'
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "pages/api/auth/[...nextauth]";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)
  const {inviteId} = req.query

  if (session) {
    const invite = await prisma.organizationInvite.findUnique({
      where: {
        id: String(inviteId),
      },
      include: {
        org: true
      }
    })
    if (invite) {
      if (invite.email === session.user.email) {
        await prisma.organizationMember.create({
          data: {
            org: {
              connect: {
                id: invite.orgId
              }
            },
            member: {
              connect: {
                id: session.user.id
              }
            },
            role: 'MEMBER'
          }
        })
        await prisma.organizationInvite.delete({
          where: {
            id: String(inviteId),
          }
        })
        res.redirect(`/org/${invite.org.slug}`)
      } else {
        res.status(403).send('You are not the invitee!')
      }
    }
    res.send('OK')
  } else {
    res.redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/api/org/invite/${inviteId}`)}`)
  }
}
