import { createDriveStorage, type Storage } from "@mini-jarvis/storage";

import { getValidGoogleAccessToken, requireAuthSession } from "./auth.server";
import type { SupabaseServerRequest, SupabaseServerResponse } from "./supabase.server";

export async function getRequestStorage(
  req: SupabaseServerRequest,
  res?: SupabaseServerResponse,
): Promise<Storage> {
  const session = await requireAuthSession(req, res);
  const accessToken = await getValidGoogleAccessToken(session);
  return createDriveStorage({
    accessToken,
    rootFolderName: "Mini Jarvis",
    refreshAccessToken: () => getValidGoogleAccessToken(session, { forceRefresh: true }),
  });
}
