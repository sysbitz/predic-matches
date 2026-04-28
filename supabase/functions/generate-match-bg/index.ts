import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { match_id, home_team, away_team } = await req.json();
    if (!match_id || !home_team || !away_team) {
      return new Response(JSON.stringify({ error: "match_id, home_team, away_team required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Cache check
    const { data: cached } = await admin
      .from("match_backgrounds")
      .select("image_url")
      .eq("match_id", match_id)
      .maybeSingle();

    if (cached?.image_url) {
      return new Response(JSON.stringify({ image_url: cached.image_url, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Cinematic dramatic football poster background. Two iconic legendary players from ${home_team} and ${away_team} national football teams facing each other in epic stylized portrait. National flags of ${home_team} on left and ${away_team} on right blended into the scene. Stadium atmosphere, golden hour lighting, dark moody color grading, vibrant team colors, high contrast. No text, no logos, no watermarks. 16:9 cinematic.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await aiResp.text();
      throw new Error(`AI error ${aiResp.status}: ${t}`);
    }

    const aiData = await aiResp.json();
    const dataUrl: string | undefined = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl) throw new Error("No image returned");

    // Upload to storage
    const base64 = dataUrl.split(",")[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const path = `match-${match_id}.png`;
    const { error: upErr } = await admin.storage
      .from("match-backgrounds")
      .upload(path, bytes, { contentType: "image/png", upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = admin.storage.from("match-backgrounds").getPublicUrl(path);
    const image_url = pub.publicUrl;

    await admin.from("match_backgrounds").upsert({ match_id, home_team, away_team, image_url });

    return new Response(JSON.stringify({ image_url, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-match-bg error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
