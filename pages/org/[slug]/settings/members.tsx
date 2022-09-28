import React from "react";
import {GetServerSideProps} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "pages/api/auth/[...nextauth]";
import prisma from "lib/prisma";
import {GlobalHead} from "components/GlobalHead";
import OrgLayout from "components/OrgLayout";
import gravatar from "gravatar";
import Image from "next/image";
import {Role} from "@prisma/client";
import {canControlUser, canSetRole, roles} from "lib/shared";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.js";
import {useRouter} from "next/router";

const ReactSwal = withReactContent(Swal)

type OrgMembersProps = {
  name: string;
  slug: string;
  selfRole: Role;
  selfName: string;
  members: {
    id: number;
    name: string;
    avatar: string;
    role: Role;
  } [];
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
      member: true,
      org: {
        include: {
          members: {
            include: {
              member: true
            },
          }
        }
      },
    }
  })

  const data: OrgMembersProps = {
    name: member.org.name,
    slug: member.org.slug,
    selfRole: member.role,
    selfName: member.member.name,
    members: member.org.members.sort((a, b) => {
      const nameA = a.member.name.toUpperCase(); // ignore upper and lowercase
      const nameB = b.member.name.toUpperCase(); // ignore upper and lowercase
      const roleA = roles.indexOf(a.role);
      const roleB = roles.indexOf(b.role);

      if (roleA === roleB) {
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      } else {
        return roleA - roleB;
      }
    }).map((member) => ({
      id: member.memberId,
      name: member.member.name,
      avatar: gravatar.url(member.member.email, {d: "retro"}, true),
      role: member.role,
    }))
  }
  return {
    props: {
      ...data
    },
  };
};

const OrgMembers = (props: OrgMembersProps) => {
  const router = useRouter();

  const setRoleOfMember = async (role: string, member: number) => {
    await fetch(`/api/org/${props.slug}/member/${member}`, {
      method: "PATCH",
      body: JSON.stringify({
        role: role
      }),
      headers: {
        "Content-Type": "application/json"
      },
    })
  }
  return (
      <>
        <GlobalHead/>
        <OrgLayout orgName={props.name} slug={props.slug}
                   crumbs={[{name: "Settings", path: "/settings"}, {name: "Members", path: "/settings/members"}]}>
          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th className="rounded-tr-box"></th>
                <th className="p-0 bg-base-100">
                  <button onClick={() => {
                    ReactSwal.fire({
                      title: 'Who do you want to invite?',
                      input: 'text',
                      inputAttributes: {
                        autocapitalize: 'off',
                        placeholder: 'example@socialtale.net'
                      },
                      showCancelButton: true,
                      confirmButtonText: 'Invite',
                      showLoaderOnConfirm: true,
                      preConfirm: (email) => {
                        return fetch(`/api/org/${props.slug}/member/invite`, {
                          method: "POST",
                          body: JSON.stringify({
                            email,
                            role: "MEMBER"
                          }),
                          headers: {
                            "Content-Type": "application/json"
                          }
                        })
                            .then(response => {
                              if (!response.ok) {
                                throw new Error(response.statusText)
                              }
                              return response.json()
                            })
                            .catch(error => {
                              ReactSwal.showValidationMessage(
                                  `Request failed: ${error}`
                              )
                            })
                      },
                      allowOutsideClick: () => !ReactSwal.isLoading()
                    }).then((result) => {
                      if (result.isConfirmed) {
                        ReactSwal.fire({
                          title: `${result.value.email} has been invited!`,
                          icon: 'success',
                          confirmButtonText: 'Ok'
                        })
                      }
                    })
                  }} className="btn btn-square ml-2">
                    +
                  </button>
                </th>
              </tr>
              </thead>
              <tbody>
              {props.members.map((member) => (
                  <tr key={member.name}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <Image height={64} width={64} src={member.avatar} alt={`Avatar of ${member.name}`}/>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select onChange={async e => await setRoleOfMember(e.currentTarget.value, member.id)}
                              defaultValue={member.role}
                              className="select select-bordered w-full max-w-xs"
                              disabled={!canControlUser(props.selfRole, member.role) || member.name === props.selfName}>
                        <option disabled={!canSetRole(props.selfRole, member.role, 'OWNER')}>OWNER</option>
                        <option disabled={!canSetRole(props.selfRole, member.role, 'ADMIN')}>ADMIN</option>
                        <option disabled={!canSetRole(props.selfRole, member.role, 'MEMBER')}>MEMBER</option>
                      </select>
                    </td>
                    <th>
                      <button disabled={!canControlUser(props.selfRole, member.role) || props.selfName === member.name}
                              className="btn btn-ghost btn-xs"
                              onClick={() => {
                                ReactSwal.fire({
                                  title: 'Are you sure?',
                                  text: "All organization data associated with this user will be deleted and their access revoked!",
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#3085d6',
                                  cancelButtonColor: '#d33',
                                  confirmButtonText: 'Yes, remove them!'
                                }).then(async (result) => {
                                  if (result.isConfirmed) {
                                    await fetch(`/api/org/${props.slug}/member/${member.id}`, {
                                      method: "DELETE",
                                    })
                                    await router.reload()
                                  }
                                })
                              }}>
                        Remove
                      </button>
                    </th>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </OrgLayout>
      </>
  );
};

export default OrgMembers;
