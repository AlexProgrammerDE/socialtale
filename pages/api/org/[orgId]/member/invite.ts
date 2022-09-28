import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from 'lib/prisma'
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "pages/api/auth/[...nextauth]";
import {canSetRole} from "lib/shared";
import nodemailer from 'nodemailer'

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
        if (!canSetRole(orgMember.role, 'MEMBER', req.body.role)) {
          res.status(403).json({message: "Insufficient permissions."})
          return
        }

        const invite = await prisma.organizationInvite.create({
          data: {
            org: {
              connect: {
                id: Number(orgId)
              }
            },
            email: req.body.email,
            role: req.body.role,
            inviter: {
              connect: {
                id: orgMember.id
              }
            }
          },
          include: {
            org: true,
          }
        });
        let transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
        const url = `${process.env.NEXTAUTH_URL}/api/org/invite/${invite.id}`
        await transporter.sendMail({
          from: process.env.EMAIL_FROM, // sender address
          to: invite.email, // list of receivers
          subject: `You have been invited to ${invite.org.name} on Socialtale`, // Subject line
          text: `Join ${invite.org.name} on Socialtale: ${url}`, // plain text body
          html: `<a href="${url}">Join ${invite.org.name} on Socialtale</a>`, // html body
        });

        res.json({email: invite.email, role: invite.role})
        break
    }
  }
}
