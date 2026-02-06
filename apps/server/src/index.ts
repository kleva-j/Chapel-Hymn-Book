import { env } from "@chapel-hymnbook/env/server";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { Hono } from "hono";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
