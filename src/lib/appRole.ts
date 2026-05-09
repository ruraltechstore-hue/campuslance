export type AppRole = "student" | "business" | "admin";

/** When a user has multiple role rows, navigation uses this priority. */
export function pickPrimaryRole(roleRows: { role: string }[]): AppRole | null {
  const roles = roleRows.map((r) => r.role);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("business")) return "business";
  if (roles.includes("student")) return "student";
  return null;
}
