import {NextApiHandler} from "next";
import NextAuth, {NextAuthOptions} from "next-auth";
import {PrismaAdapter} from '@next-auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import prisma from '../../../lib/prisma'

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, authOptions);
export default authHandler;

const adapter = PrismaAdapter(prisma)
export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    })
  ],
  events: {
    createUser: async (user) => {
      user.user.name = user.user.email.split('@')[0]
    }
  },
  adapter: {
    createSession(session) {
      return adapter.createSession(session);
    },
    createUser(user) {
      user.name = (user.email! as string).split('@')[0];
      return adapter.createUser(user);
    },
    createVerificationToken(verificationToken) {
      return adapter.createVerificationToken(verificationToken);
    },
    deleteSession(sessionToken) {
      return adapter.deleteSession(sessionToken);
    },
    deleteUser(userId) {
      return adapter.deleteUser(userId);
    },
    getSessionAndUser(sessionToken) {
      return adapter.getSessionAndUser(sessionToken);
    },
    getUser(id) {
      return adapter.getUser(id);
    },
    getUserByAccount(providerAccountId) {
      return adapter.getUserByAccount(providerAccountId);
    },
    getUserByEmail(email) {
      return adapter.getUserByEmail(email);
    },
    linkAccount(account) {
      return adapter.linkAccount(account);
    },
    unlinkAccount(providerAccountId) {
      return adapter.unlinkAccount(providerAccountId);
    },
    updateSession(session) {
      return adapter.updateSession(session);
    },
    updateUser(user) {
      return adapter.updateUser(user);
    },
    useVerificationToken(params) {
      return adapter.useVerificationToken(params);
    }
  },
};
