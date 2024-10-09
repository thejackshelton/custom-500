//github.com/honojs/middleware/blob/main/packages/qwik-city/src/index.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  _deserializeData,
  _serializeData,
  _verifySerializable,
} from "@builder.io/qwik";

import { setServerPlatform } from "@builder.io/qwik/server";
import {
  mergeHeadersCookies,
  requestHandler,
  type ClientConn,
  type ServerRenderOptions,
  type ServerRequestEvent,
} from "@builder.io/qwik-city/middleware/request-handler";

import { env } from "hono/adapter";
import type { MiddlewareHandler } from "hono";

/** @public */
export interface QwikCityHonoOptions extends ServerRenderOptions {
  getClientConn?: (request: Request) => ClientConn;
}

// Hono middleware for Qwik City
/** @public */
export const qwikMiddleware = (
  opts: QwikCityHonoOptions
): MiddlewareHandler => {
  // different javascript environments
  if (!globalThis.TextEncoderStream as unknown) {
    throw new Error("Missing globalThis.TextEncoderStream");
  }

  // this will change in qwik v2
  const qwikSerializer = {
    _deserializeData,
    _serializeData,
    _verifySerializable,
  };

  if (opts.manifest) {
    setServerPlatform(opts.manifest);
  }

  return async (c, next) => {
    const url = new URL(c.req.url);
    const request = c.req.raw;
    const serverRequestEv: ServerRequestEvent<Response> = {
      mode: "server",
      locale: undefined,
      url,
      request,
      getWritableStream: (status, headers, cookies, resolve) => {
        const { readable, writable } = new TransformStream();
        const response = new Response(readable, {
          status,
          headers: mergeHeadersCookies(headers, cookies),
        });
        resolve(response);
        return writable;
      },
      getClientConn: () => {
        return opts.getClientConn ? opts.getClientConn(c.req.raw) : {};
      },
      platform: {},
      env: {
        get: (key: string) => {
          return env(c)[key];
        },
      },
    };
    const handledResponse = await requestHandler(
      serverRequestEv,
      opts,
      qwikSerializer
    );
    if (handledResponse) {
      handledResponse.completion.then((v) => {
        if (v) {
          console.error(v);
        }
      });
      const response = await handledResponse.response;
      if (response) {
        return response;
      }
    }
    await next();
  };
};
