import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCurrentUser() {
  const me = useQuery(api.users.getMe);
  const loading = me === undefined;

  return { me: me ?? null, email: me?.email, loading };
}

// These are no longer needed but kept empty to avoid crashing old imports
export function setSessionEmail() {}
export function clearSessionEmail() {}
