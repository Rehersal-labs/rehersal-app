import type { Organization, Role } from "@/types";

/** Client-safe auth helpers (no server imports). */

export function isTeamMode(org: Organization): boolean {
  return org.mode === "team";
}

export function canManageTeam(role: Role): boolean {
  return role === "owner" || role === "coach";
}

export function isAdmin(role: Role): boolean {
  return role === "owner";
}
