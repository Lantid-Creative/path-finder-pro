import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, location, nearbyAlerts } = await req.json();

    const systemPrompt = `You are PATHLY AI — a personal safety assistant built into a safety-first navigation app. You help users stay safe while walking, commuting, and traveling.

Your capabilities:
- Analyze area safety based on community reports and alerts
- Suggest safer routes and alternatives
- Provide emergency guidance and safety tips
- Answer questions about personal safety
- Help users report incidents

Current context:
${location ? `User location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Location not shared"}
${nearbyAlerts?.length ? `Nearby alerts (${nearbyAlerts.length}): ${nearbyAlerts.map((a: any) => `[${a.type}] ${a.message} at ${a.location_name || "unknown"}`).join("; ")}` : "No active alerts nearby"}

Guidelines:
- Be concise and actionable
- Prioritize user safety above all
- If the user seems in danger, provide immediate actionable steps
- Use clear, calm language even in emergencies
- When analyzing safety, consider time of day, recent reports, and area characteristics
- Always recommend contacting emergency services (911) for immediate threats
- Format responses with markdown for readability`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm having trouble responding right now. If you're in danger, please call 911 immediately.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Safety Assistant error:", error);
    return new Response(
      JSON.stringify({ reply: "I'm temporarily unavailable. If you need immediate help, call 911." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
