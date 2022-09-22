import {useState} from "react";
import {GlobalHead} from "../../components/GlobalHead";
import Layout, {Theme} from "../../components/Layout";
import {signOut} from "next-auth/react";
import {useRouter} from "next/router";
import {Theme as PrismaTheme} from "@prisma/client";
import prisma from "../../lib/prisma";
import {GetServerSideProps} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../api/auth/[...nextauth]";

interface ThemeData {
  name: string;
  value: string;
}

const themes = Object.keys(PrismaTheme);

const themeData: ThemeData[] = themes.map((theme) => ({
  name: theme.charAt(0) + theme.toLowerCase().substring(1, theme.length),
  value: theme.toLowerCase()
}));

type SettingsProps = {
  nameOriginal: string;
  themeOriginal: string;
  emailOriginal: string;
  notificationsOriginal: boolean;
}

const Settings = ({
                    nameOriginal,
                    themeOriginal,
                    notificationsOriginal,
                    emailOriginal
                  }: SettingsProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(nameOriginal);
  const [emailNotifications, setEmailNotifications] = useState(notificationsOriginal);
  const [formTheme, setFormTheme] = useState(themeOriginal);

  function deleteAccount() {
    fetch("/api/settings", {method: 'delete'}).then(() => {
      signOut().then(() => {
        router.push("/").then();
      });
    });
  }

  return (
      <>
        <GlobalHead/>
        <Layout>
          <main className="container flex-grow p-2">
            <h1 className="text-2xl font-bold">Settings</h1>
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
                  fetch("/api/settings", {
                    method: "post", body: JSON.stringify({
                      name,
                      emailNotifications,
                      theme: formTheme.toUpperCase()
                    }),
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  })
                      .then(() => {
                        setIsLoading(false);
                        setError(null);
                        router.reload();
                      })
                      .catch((res) => {
                        setIsLoading(false);
                        setError(`${res.response.data.message}`);
                      });
                }}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Your Email</span>
                </label>
                <label className="input-group">
                  <span>Email</span>
                  <input
                      disabled
                      type="text"
                      value={emailOriginal}
                      className="input input-bordered"
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Your Name</span>
                </label>
                <label className="input-group">
                  <span>Name</span>
                  <input
                      type="text"
                      defaultValue={nameOriginal}
                      maxLength={20}
                      minLength={3}
                      onInput={(e) => setName(e.currentTarget.value)}
                      placeholder="SomeUsername"
                      className="input input-bordered"
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label max-w-[12rem] cursor-pointer">
                  <span className="label-text">Email Notifications</span>
                  <input
                      id="input-emailNotifications"
                      name="emailNotifications"
                      type="checkbox"
                      onInput={(e) =>
                          setEmailNotifications(e.currentTarget.checked)
                      }
                      className="checkbox checkbox-primary"
                      defaultChecked={notificationsOriginal}
                  />
                </label>
              </div>

              <Theme.Consumer>
                {({theme, setTheme}) => (
                    <div className="form-control w-full max-w-xs">
                      <label className="label">
                        <span className="label-text">Theme</span>
                      </label>
                      <select
                          id="input-theme"
                          value={theme}
                          name="theme"
                          className="select select-bordered"
                          onChange={(event) => {
                            setFormTheme(event.currentTarget.value);
                            setTheme(event.target.value);
                          }}
                      >
                        {themeData.map(({name, value}) => (
                            <option key={value} value={value}>
                              {name}
                            </option>
                        ))}
                      </select>
                    </div>
                )}
              </Theme.Consumer>

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
            <label
                htmlFor="delete-modal"
                className="modal-button btn btn-error mt-6"
            >
              Delete Account
            </label>
            <input type="checkbox" id="delete-modal" className="modal-toggle"/>
            <div className="modal" id="delete-modal">
              <div className="modal-box">
                <h3 className="text-lg font-bold">
                  Do you really want to delete your account?
                </h3>
                <p className="py-4">
                  This action will permanently delete your entire account and every data associated with you will be
                  deleted.
                </p>
                <div className="modal-action">
                  <label htmlFor="delete-modal" className="btn btn-primary">
                    NO
                  </label>
                  <label
                      onClick={deleteAccount}
                      htmlFor="delete-modal"
                      className="btn btn-error"
                  >
                    YES
                  </label>
                </div>
              </div>
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

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    }
  })

  const data: SettingsProps = {
    emailOriginal: user.email,
    nameOriginal: user.name,
    notificationsOriginal: user.emailNotifications,
    themeOriginal: user.theme
  }

  return {
    props: {
      ...data
    }
  }
}

// noinspection JSUnusedGlobalSymbols
export default Settings;
