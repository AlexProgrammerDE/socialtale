import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from '../../../../lib/prisma'
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../../auth/[...nextauth]";
import {generateSlug, MAX_ORG_NAME_LENGTH, MIN_ORG_NAME_LENGTH} from "../../../../lib/shared";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const {slug} = req.query
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
            slug: slug as string,
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
            slug: slug as string,
          }
        })
        res.send('OK')
        break
    }
  }
}
