import React, {useEffect} from "react";
import {GlobalHead} from "../components/GlobalHead";
import Layout from "../components/Layout";
import prisma from "../lib/prisma";
import {GetServerSideProps} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "./api/auth/[...nextauth]";

type Message = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  seen: boolean;
  sender: String;
}

type InboxProps = {
  inbox: Message[];
}

const Inbox = (props: InboxProps) => {
  useEffect(() => {
    fetch("/api/inboxread").then()
  }, [])

  return (
      <>
        <GlobalHead/>
        <Layout>
          <main className="container h-full p-2">
            <h1 className="text-2xl font-bold">Your Inbox</h1>
            <div className="flex flex-col h-full">
              {props.inbox.length === 0 && (
                  <div className="flex justify-center h-full">
                    <h2 className="m-auto text-4xl font-bold">
                      Your inbox is empty. :(
                    </h2>
                  </div>
              )}
              {props.inbox.map((message) => (
                  <div key={message.id} className="card md:card-normal card-compact m-2 md:w-96 bg-base-200 shadow-lg">
                    <div className="card-body justify-between">
                      <h2 className="break-text card-title place-items-start flex-col">
                        Message by {message.sender}
                      </h2>
                      <p className="break-text card-subtitle">
                        {message.content}
                      </p>
                      <time className="card-subtitle">
                        {new Date(message.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>
              ))}
            </div>
          </main>
        </Layout>
      </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const member = await prisma.user.findUnique({
    where: {
      email: session.user.email
    },
    include: {
      messages: true
    }
  })

  const data: InboxProps = {
    inbox: member.messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      sender: message.sender,
      seen: message.seen,
    })),
  }

  return {
    props: {
      ...data
    }
  }
}

// noinspection JSUnusedGlobalSymbols
export default Inbox;
