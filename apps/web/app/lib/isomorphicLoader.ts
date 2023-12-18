import { makeTRPCClient } from "@peated/server/lib/trpc";
import { type User } from "@peated/server/types";
import config from "@peated/web/config";
import { type ClientLoaderFunctionArgs } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/server-runtime";
import { captureException } from "@sentry/remix";

export type IsomorphicContext = {
  request: LoaderFunctionArgs["request"] | ClientLoaderFunctionArgs["request"];
  params: LoaderFunctionArgs["params"] | ClientLoaderFunctionArgs["params"];
  context: {
    trpc: ReturnType<typeof makeTRPCClient>;
    user: User | null;
  };
  isServer: boolean;
};

type DataFunctionValue = Response | NonNullable<unknown> | null;

type DataCallback<T extends DataFunctionValue> = (
  context: IsomorphicContext,
) => Promise<T>;

/**
 * Builds a loader which gives access to a uniform context object, using DI to inject
 * identical interfaces which can be run against the client and server.
 *
 * ```
 * export const { loader, clientLoader } = makeIsomorphicLoader(async ({ params, context: { trpc }}) => {
 *  invariant(params.bottleId);
 *  const bottle = await trpc.bottleById.query(Number(params.bottleId));
 *  return { bottle };
 * });
 * ```
 */
export function makeIsomorphicLoader<T extends DataFunctionValue>(
  callback: DataCallback<T>,
) {
  return {
    loader: async function loader({
      request,
      params,
      context: { trpc, user },
    }: LoaderFunctionArgs) {
      const context: IsomorphicContext = {
        request,
        params,
        context: { trpc, user },
        isServer: true,
      };
      const payload = await callback(context);
      if (payload instanceof Response) return payload;
      return json(payload);
    },
    clientLoader: async function clientLoader({
      request,
      params,
    }: ClientLoaderFunctionArgs) {
      const trpcClient = makeTRPCClient(
        config.API_SERVER,
        window.REMIX_CONTEXT.accessToken,
        captureException,
      );

      const context: IsomorphicContext = {
        request,
        params,
        context: { trpc: trpcClient, user: window.REMIX_CONTEXT.user },
        isServer: false,
      };
      return await callback(context);
    },
  };
}
