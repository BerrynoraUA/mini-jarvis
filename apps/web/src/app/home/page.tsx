import { redirect } from "next/navigation";

import { getAuthSessionFromCookies } from "@/lib/auth.server";

import { Home } from "./home";

export default async function HomePage() {
  const session = await getAuthSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  return <Home user={{ name: session.name, email: session.email }} />;
}
