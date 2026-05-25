import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Ongeldige link", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: tokenRecord, error } = await supabase
      .from("download_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !tokenRecord) {
      return new Response("Downloadlink niet gevonden", { status: 404, headers: corsHeaders });
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return new Response("Downloadlink is verlopen", { status: 410, headers: corsHeaders });
    }

    if (tokenRecord.download_count >= tokenRecord.max_downloads) {
      return new Response("Maximaal aantal downloads bereikt", { status: 410, headers: corsHeaders });
    }

    // Increment download count
    await supabase
      .from("download_tokens")
      .update({ download_count: tokenRecord.download_count + 1 })
      .eq("id", tokenRecord.id);

    // Extract the storage path from the public URL
    const pdfUrl: string = tokenRecord.pdf_url;
    const bucketName = "smb";
    const storageBasePattern = `/storage/v1/object/public/${bucketName}/`;
    const pathIndex = pdfUrl.indexOf(storageBasePattern);

    if (pathIndex === -1) {
      // URL is not a Supabase storage URL — redirect directly
      return Response.redirect(pdfUrl, 302);
    }

    const storagePath = pdfUrl.substring(pathIndex + storageBasePattern.length);

    // Create a short-lived signed URL (60 seconds)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(storagePath, 60, { download: `${tokenRecord.product_name}.pdf` });

    if (signedError || !signedData?.signedUrl) {
      console.error("Signed URL error:", signedError);
      return new Response("Kon downloadlink niet aanmaken", { status: 500, headers: corsHeaders });
    }

    return Response.redirect(signedData.signedUrl, 302);
  } catch (e: any) {
    console.error("Download PDF error:", e);
    return new Response(e?.message || "Serverfout", { status: 500, headers: corsHeaders });
  }
});
