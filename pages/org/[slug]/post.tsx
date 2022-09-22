import React, {useState} from "react";
import {GetServerSideProps} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../../api/auth/[...nextauth]";
import prisma from "../../../lib/prisma";
import {GlobalHead} from "../../../components/GlobalHead";
import OrgLayout from "../../../components/OrgLayout";
import {useRouter} from "next/router";
import {PostPlatform} from "../../../lib/shared";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.js";

const ReactSwal = withReactContent(Swal)

interface PlatformData {
  [postPlatform: string]: {
    userId: string;
  }[]
}

type OrgPostProps = {
  name: string;
  slug: string;
  platforms: PlatformData;
}

export const getServerSideProps: GetServerSideProps = async ({req, res, params}) => {
      const session = await unstable_getServerSession(req, res, authOptions)

      if (!session) {
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        }
      }

      const {slug} = params;

      const member = await prisma.organizationMember.findFirst({
        where: {
          member: {
            email: session.user.email,
          },
          org: {
            slug: slug as string,
          }
        },
        include: {
          org: {
            include: {
              members: {
                include: {
                  member: true
                }
              },
              twitterAccounts: true,
              instagramAccounts: true,
              facebookAccounts: true,
              tiktokAccounts: true,
              googleAccounts: true,
            }
          },
        }
      })

      const platformData: PlatformData = {};

      if (member.org.twitterAccounts.length > 0) {
        platformData.twitter = member.org.twitterAccounts.map((account) => {
          return {
            userId: account.userId,
          }
        })
      }

      const data: OrgPostProps = {
        name: member.org.name,
        slug: member.org.slug,
        platforms: platformData,
      }
      return {
        props: {
          ...data
        },
      };
    }
;

const OrgSettings = (props: OrgPostProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState<PostPlatform>(Object.keys(props.platforms)[0] as PostPlatform);
  const [userId, setUserId] = useState(props.platforms[platform][0].userId);

  return (
      <>
        <GlobalHead/>
        <OrgLayout orgName={props.name} slug={props.slug} crumbs={[{name: "Post", path: "/post"}]}>
          {error && (
              <div className="alert alert-error my-3 shadow-lg">
                <div>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 flex-shrink-0 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
          )}
          <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (isLoading) {
                  return;
                }

                setIsLoading(true);
                fetch(`/api/org/${props.slug}/post/create`, {
                  method: "POST", body: JSON.stringify({
                    userId,
                    platform,
                    content,
                  }),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                })
                    .then(() => {
                      setIsLoading(false);
                      setError(null);
                      ReactSwal.fire({
                        title: 'Success!',
                        text: 'Your post has been created.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#1a202c',
                      }).then(() => {
                        router.push(`/org/${props.slug}`);
                      });
                    })
                    .catch((res) => {
                      setIsLoading(false);
                      setError(`${res.response.data.message}`);
                    });
              }}
          >
            <input type="text" className="hidden"/>
            <input type="text" className="hidden"/>
            <input type="text" className="hidden"/>
            <div className="flex flex-col">
              <label className="label">
                <span className="label-text">Platform</span>
              </label>
              <select
                  id="platform"
                  name="platform"
                  className="mt-1 select select-bordered"
                  defaultValue={platform}
                  onChange={(e) => {
                    setPlatform(e.currentTarget.value as PostPlatform);
                    setUserId(props.platforms[e.target.value as PostPlatform][0].userId);
                  }}
              >
                {Object.keys(props.platforms).map((postPlatform) => (
                    <option key={postPlatform} value={postPlatform}>
                      {postPlatform}
                    </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col mt-4">
              <label className="label">
                <span className="label-text">User ID</span>
              </label>
              <select
                  id="userId"
                  name="userId"
                  className="mt-1 select select-bordered"
                  defaultValue={userId}
                  onChange={(e) => {
                    setUserId(e.currentTarget.value);
                  }}
              >
                {props.platforms[platform].map((data) => (
                    <option key={data.userId} value={data.userId}>
                      {data.userId}
                    </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Post Content</span>
              </label>
              <textarea
                  onInput={(e) => setContent(e.currentTarget.value)}
                  placeholder="Your post content"
                  className="textarea textarea-bordered"
              />
            </div>
            <div className="form-control">
              <div>
                <input
                    type="submit"
                    className="btn btn-primary mt-6"
                    value="Submit"
                />
              </div>
            </div>
          </form>
        </OrgLayout>
      </>
  );
};

export default OrgSettings;
