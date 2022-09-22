import {Role} from "@prisma/client";

export const roles: string[] = Object.keys(Role);

export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export const MAX_ORG_NAME_LENGTH = 50;
export const MIN_ORG_NAME_LENGTH = 3;

export const breakpointColumnsObj = {
  default: 3,
  1200: 2,
  800: 1
};

interface OrganizationMember {
  role: Role;
}

export function canSetRole(actor: Role, target: Role, role: Role): boolean {
  return roles.indexOf(role) > roles.indexOf(actor) && canControlUser(actor, target);
}

export function canControlUser(actor: Role, target: Role): boolean {
  return roles.indexOf(actor) < roles.indexOf(target);
}

export type PostPlatform = 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'youtube';
