import qwikCityPlan from "@qwik-city-plan";
import built_render from "./entry.ssr";
import { logger } from "hono/logger";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import { qwikMiddleware } from "~/qwik-hono";

interface EntryHonoProps {
  app?: Hono;
  base?: string;
  render?: typeof built_render;
}
export default function createEntryHono({
  app,
  base,
  render = (_ops) => {
    // make sure we can pass base
    _ops.base = base || _ops.base || "/build/";
    return built_render(_ops);
  },
}: EntryHonoProps) {
  if (!app) {
    app = new Hono();
    app.get("*", logger());
  }

  console.log("I AM ON SERVER!!!");

  // Qwik handles GET and POST requests
  app.use("*", qwikMiddleware({ base, render, qwikCityPlan }));

  console.log("SERVINGGG!!!");

  serve({
    port: 3008,
    fetch: app.fetch,
  });

  return app;
}

const app = new Hono();

app.get("*", logger());

const origin = "http://localhost:3008";

createEntryHono({
  app,
  base: `${origin}/build/`,
});

console.log("DID I RUN?");
app.use("/*", serveStatic({ root: "./server" }));
