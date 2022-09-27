import {useState} from "react";
import {GlobalHead} from "../../components/GlobalHead";
import Layout from "../../components/Layout";
import {useRouter} from "next/router";
import prisma from "../../lib/prisma";
import {GetServerSideProps} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../api/auth/[...nextauth]";
import {generateSlug, MAX_ORG_NAME_LENGTH, MIN_ORG_NAME_LENGTH} from "../../lib/shared";

type OrgCreateProps = {
  canCreateOrg: boolean;
}

const CreateOrg = (props: OrgCreateProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(props.canCreateOrg ? null :
      "You have reached the maximum number of organizations you can create.");
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');

  return (
      <>
        <GlobalHead/>
        <Layout>
          <main className="container flex-grow p-2">
            <h1 className="text-2xl font-bold">Create organization</h1>
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
            {props.canCreateOrg &&
                <form
                    onSubmit={async (e) => {
                      e.preventDefault();

                      if (isLoading) {
                        return;
                      }

                      setIsLoading(true);
                      fetch("/api/org/create", {
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
                            router.push("/dashboard")
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
                    <div className="form-control max-w-lg">
                        <label className="label">
                            <span className="label-text">Organization Name</span>
                          {name.length != 0 && <span className="label-text-alt">@{generateSlug(name)}</span>}
                        </label>
                        <label className="input-group">
                            <span>Name</span>
                            <input
                                type="text"
                                defaultValue={name}
                                maxLength={MAX_ORG_NAME_LENGTH}
                                minLength={MIN_ORG_NAME_LENGTH}
                                onInput={(e) => setName(e.currentTarget.value)}
                                placeholder="The magic team"
                                className="input input-bordered w-full"
                                required
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
            }
          </main>
        </Layout>
      </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    include: {
      owningOrg: true
    }
  })

  const data: OrgCreateProps = {
    canCreateOrg: user.owningOrg.length < 1,
  }

  return {
    props: {
      ...data
    }
  }
}

// noinspection JSUnusedGlobalSymbols
export default CreateOrg;
