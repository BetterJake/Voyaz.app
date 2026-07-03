import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  return client;
}

/**
 * Returns a Supabase browser client. The underlying `createBrowserClient` call
 * is deferred until a property is first accessed, so importing modules that call
 * `createClient()` at module scope does not instantiate the client during
 * server-side prerendering (where the public env vars may be unavailable and the
 * browser client should never run anyway).
 */
export function createClient(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get(_target, prop, receiver) {
      const value = Reflect.get(getClient(), prop, receiver);
      return typeof value === "function" ? value.bind(getClient()) : value;
    },
  });
}
