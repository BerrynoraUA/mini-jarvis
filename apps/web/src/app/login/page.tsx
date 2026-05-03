import { redirect } from "next/navigation";
import type { SearchParams } from "next/dist/server/request/search-params";

import { getAuthSessionFromCookies } from "@/lib/auth.server";

import { Login } from "./login";

interface LoginPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAuthSessionFromCookies();
  if (session) {
    redirect("/home");
  }

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return <Login error={error} />;
}
