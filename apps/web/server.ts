import { existsSync, readFileSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import type { IncomingMessage, ServerResponse } from "node:http";
import { networkInterfaces } from "node:os";

import next from "next";
import nextPackage from "next/package.json";

import { handleApiRequest } from "./src/api/server";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOSTNAME ?? "0.0.0.0";

function getLocalIpAddress() {
  const interfaces = networkInterfaces();

  for (const values of Object.values(interfaces)) {
    for (const entry of values ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address;
      }
    }
  }

  return null;
}

function logStartupBanner(input: {
  useHttps: boolean;
  startedAt: number;
}) {
  const protocol = input.useHttps ? "https" : "http";
  const localHost = hostname === "0.0.0.0" ? "localhost" : hostname;
  const networkHost = getLocalIpAddress();
  const envFiles = [".env.local", ".env"].filter((file) => existsSync(file));
  const readyInMs = Date.now() - input.startedAt;

  console.log(`▲ Next.js ${nextPackage.version}`);
  console.log(`- Local:         ${protocol}://${localHost}:${port}`);
  if (networkHost) {
    console.log(`- Network:       ${protocol}://${networkHost}:${port}`);
  }
  if (envFiles.length > 0) {
    console.log(`- Environments: ${envFiles.join(", ")}`);
  }
  console.log(`✓ Ready in ${readyInMs}ms`);
}

async function bootstrap() {
  const startedAt = Date.now();
  const app = next({ dev, dir: process.cwd(), hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  const requestListener = async (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
  ) => {
    try {
      if ((req.url ?? "").startsWith("/api/")) {
        const handled = await handleApiRequest(req, res);
        if (handled) {
          return;
        }
      }

      await handle(req, res);
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  };

  const useHttps = process.env.MJ_HTTPS === "1";
  const server = useHttps
    ? createHttpsServer(
        {
          key: readFileSync(process.env.MJ_SSL_KEY ?? "./certificates/localhost-key.pem"),
          cert: readFileSync(process.env.MJ_SSL_CERT ?? "./certificates/localhost.pem"),
        },
        requestListener,
      )
    : createHttpServer(requestListener);

  server.listen(port, hostname, () => {
    logStartupBanner({ useHttps, startedAt });
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
