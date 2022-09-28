import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from 'lib/prisma'
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "pages/api/auth/[...nextauth]";
import {generateSlug, MAX_ORG_NAME_LENGTH, MIN_ORG_NAME_LENGTH} from "lib/shared";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const {orgId} = req.query
  const session = await unstable_getServerSession(req, res, authOptions)

  const orgMember = await prisma.organizationMember.findFirst({
    where: {
      orgId: Number(orgId),
      member: {
        id: session.user.id
      }
    }
  })

  if (session) {
    switch (req.method.toUpperCase()) {
      case 'POST':
        if (orgMember.role !== 'OWNER' && orgMember.role !== 'ADMIN') {
          res.status(401).send('Unauthorized')
          break
        }

        if (req.body.name.length < MIN_ORG_NAME_LENGTH) {
          res.status(400).send('Name is too short!')
          break
        }

        if (req.body.name.length > MAX_ORG_NAME_LENGTH) {
          res.status(400).send('Name is too long!')
          break
        }

        await prisma.organization.update({
          where: {
            id: Number(orgId),
          },
          data: {
            name: req.body.name,
            slug: generateSlug(req.body.name),
          }
        })
        res.send('OK')
        break
      case 'DELETE':
        if (orgMember.role !== 'OWNER') {
          res.status(401).send('Unauthorized')
          break
        }

        await prisma.organization.delete({
          where: {
            id: Number(orgId),
          }
        })
        res.send('OK')
        break
    }
  }
}
