import alchemy from "alchemy";

import { Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/server/.env" });

const CORS_ORIGIN = alchemy.env.CORS_ORIGIN;

if (!CORS_ORIGIN) {
  throw new Error("CORS_ORIGIN environment variable is required");
}

const app = await alchemy("Chapel-Hymn-Book");

export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: { CORS_ORIGIN },
  dev: { port: 3000 },
});

console.log(`Server -> ${server.url}`);

await app.finalize();
