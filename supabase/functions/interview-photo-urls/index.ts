import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const BUCKET = "interview-photos";

const toPath = (v: string): string | null => {
  const s = v.trim();
  if (!s || s.startsWith("/") || s.startsWith("data:")) return null;
  if (!s.startsWith("http")) return s.startsWith(`${BUCKET}/`) ? s.slice(BUCKET.length + 1) : s;
  try {
    const u = new URL(s);
    const m = `/${BUCKET}/`;
    const i = u.pathname.indexOf(m);
    return i === -1 ? null : decodeURIComponent(u.pathname.slice(i + m.length));
  } catch { return null; }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await admin.from("home_interviews").select("image_url");
    if (error) throw error;
    const paths = Array.from(new Set((data ?? []).map((r) => toPath(r.image_url ?? "")).filter(Boolean))) as string[];
    const urls: Record<string, string> = {};
    if (paths.length) {
      const { data: signed } = await admin.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 24);
      for (const s of signed ?? []) if (s.path && s.signedUrl) urls[s.path] = s.signedUrl;
    }
    return new Response(JSON.stringify({ urls }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Kon foto's niet laden" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
