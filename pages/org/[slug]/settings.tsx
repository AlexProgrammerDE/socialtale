import React, {useState} from "react";
import {GetServerSideProps} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../../api/auth/[...nextauth]";
import prisma from "../../../lib/prisma";
import {GlobalHead} from "../../../components/GlobalHead";
import OrgLayout from "../../../components/OrgLayout";
import {useRouter} from "next/router";
import {generateSlug, MAX_ORG_NAME_LENGTH, MIN_ORG_NAME_LENGTH} from "../../../lib/shared";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.js";

const ReactSwal = withReactContent(Swal)

type OrgSettingsProps = {
  name: string;
  slug: string;
}

export const getServerSideProps: GetServerSideProps = async ({req, res, params}) => {
  const session = await unstable_getServerSession(req, res, authOptions)
  const {slug} = params;

  const member = await prisma.organizationMember.findFirst({
    where: {
      memberId: session.user.id,
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
          }
        }
      },
    }
  })

  const data: OrgSettingsProps = {
    name: member.org.name,
    slug: member.org.slug
  }
  return {
    props: {
      ...data
    },
  };
};

const OrgSettings = (props: OrgSettingsProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(props.name);

  function deleteOrg() {
    fetch(`/api/org/${props.slug}/settings`, {method: 'delete'}).then(async () => {
      await router.push("/");
    });
  }

  return (
      <>
        <GlobalHead/>
        <OrgLayout orgName={props.name} slug={props.slug} crumbs={[{name: "Settings", path: "/settings"}]}>
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
                fetch(`/api/org/${props.slug}/settings`, {
                  method: "post", body: JSON.stringify({
                    name,
                  }),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                })
                    .then(() => {
                      setIsLoading(false);
                      setError(null);
                      router.push(`/org/${generateSlug(name)}/settings`);
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
            <div className="form-control">
              <label className="label">
                <span className="label-text">Organization Name</span>
              </label>
              <label className="input-group">
                <span>Name</span>
                <input
                    type="text"
                    defaultValue={props.name}
                    maxLength={MAX_ORG_NAME_LENGTH}
                    minLength={MIN_ORG_NAME_LENGTH}
                    onInput={(e) => setName(e.currentTarget.value)}
                    placeholder="The magic team"
                    className="input input-bordered"
                />
              </label>
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
          <button
              className="btn btn-error mt-6"
              onClick={() => {
                ReactSwal.fire({
                  title: `Do you really want to delete ${props.name}?`,
                  text: "This action will permanently delete your entire organization and all data associated with it will be deleted.",
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Yes, delete it!',
                  cancelButtonText: 'No, keep it'
                }).then((result) => {
                  if (result.isConfirmed) {
                    deleteOrg();
                  }
                })
              }}
          >
            Delete Organization
          </button>
        </OrgLayout>
      </>
  );
};

export default OrgSettings;
