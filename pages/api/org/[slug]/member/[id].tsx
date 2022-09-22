import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from '../../../../../lib/prisma'
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../../../auth/[...nextauth]";
import {canControlUser, canSetRole} from "../../../../../lib/shared";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const {slug, id} = req.query
  const session = await unstable_getServerSession(req, res, authOptions)

  const orgMember = await prisma.organizationMember.findFirst({
    where: {
      org: {
        slug: slug as string
      },
      member: {
        email: session.user.email
      }
    }
  })

  const targetMember = await prisma.organizationMember.findFirst({
    where: {
      org: {
        slug: slug as string
      },
      memberId: Number(id)
    }
  })

  if (targetMember.memberId === orgMember.memberId) {
    res.status(400).json({message: "You can't edit your status on the organization"})
    return
  }

  if (session) {
    switch (req.method.toUpperCase()) {
      case 'PATCH':
        if (!canSetRole(orgMember.role, targetMember.role, req.body.role)) {
          res.status(400).json({message: "You can't set this role"})
          return
        }
        await prisma.organizationMember.updateMany({
          where: {
            memberId: Number(id),
          },
          data: {
            role: req.body.role,
          }
        })
        res.send('OK')
        break
      case 'DELETE':
        if (!canControlUser(orgMember.role, targetMember.role)) {
          res.status(400).json({message: "You can't remove this member"})
          return
        }

        await prisma.organizationMember.deleteMany({
          where: {
            memberId: Number(id),
          }
        })
        res.send('OK')
        break
    }
  }
}
