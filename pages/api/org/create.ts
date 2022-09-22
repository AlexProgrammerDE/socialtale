import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from '../../../lib/prisma'
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]";
import {generateSlug, MAX_ORG_NAME_LENGTH, MIN_ORG_NAME_LENGTH} from "../../../lib/shared";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (session) {
    switch (req.method.toUpperCase()) {
      case 'POST':
        if (req.body.name.length < MIN_ORG_NAME_LENGTH) {
          res.status(400).send('Name is too short!')
          break
        }
        if (req.body.name.length > MAX_ORG_NAME_LENGTH) {
          res.status(400).send('Name is too long!')
          break
        }

        const org = await prisma.organization.create({
          data: {
            name: req.body.name,
            slug: generateSlug(req.body.name),
            owner: {
              connect: {
                email: session.user.email
              }
            }
          }
        })
        await prisma.organizationMember.create({
          data: {
            org: {
              connect: {
                id: org.id
              }
            },
            member: {
              connect: {
                email: session.user.email
              }
            },
            role: 'OWNER'
          }
        })
        res.send('OK')
        break
    }
  }
}
