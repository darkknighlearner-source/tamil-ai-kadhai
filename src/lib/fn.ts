import { supabase } from "@/integrations/supabase/client";

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function invokeFn<T = unknown>(name: string, body: unknown): Promise<T> {
  const session = (await supabase.auth.getSession()).data.session;
  const resp = await fetch(`${FN_BASE}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ANON}`,
      apikey: ANON,
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error((data as { error?: string }).error ?? `Function ${name} failed (${resp.status})`);
  return data as T;
}
