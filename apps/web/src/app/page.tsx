import { redirect } from "next/navigation";

import { getAuthSessionFromCookies } from "@/lib/auth.server";

export default async function RootPage() {
  const session = await getAuthSessionFromCookies();
  redirect(session ? "/home" : "/login");
}
