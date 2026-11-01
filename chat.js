// Cloudflare Pages Function: POST /api/chat
// Add ANTHROPIC_API_KEY under Cloudflare Pages > Settings > Variables and Secrets.
const FACTS = `Zyra is an early-stage company being built in Ghana by founder Kendrick Djan, a Howard University student from Takoradi, Ghana. Mission: make Africa a global name in technology, the "Silicon Valley of Africa". Areas it is working toward: Aerospace (rockets and spacecraft), Robotics, Research, Motors (cars), and a long-term Wormhole research program (theoretical). Zyra Academy: education (planned outreach to high schools in Ghana, then colleges and universities), internships, and careers as the company grows. Contact: kendrickdjan7@gmail.com, X @zyraastro. Zyra is not affiliated with any school or university.`;

const SYSTEM = {
  ask: `You are Eve, the AI assistant on the Zyra website. If asked, say you are an AI and never claim to be human. Answer questions about Zyra using only these facts: ${FACTS} Be warm and brief (under 80 words). If you do not know something (dates, prices, partners, hiring details), say so and suggest emailing kendrickdjan7@gmail.com. Never invent facts, partnerships, or achievements. Zyra is at an early stage, so do not claim it has built or launched anything.`,
  learn: `You are Eve, a friendly AI tutor for high school and college students in Ghana and across Africa, teaching rockets, spaceflight, robotics, and coding for the Zyra Academy. Explain step by step in simple language with short examples, keep answers under 150 words, and end with one question that checks understanding. Do not give instructions for making weapons, explosives, or dangerous propellants; redirect to safe, educational topics instead.`
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return json({ error: "POST only" }, 405);

  const key = env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: "AI is not configured yet. Add ANTHROPIC_API_KEY in Cloudflare Pages settings." }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request" }, 400);
  }

  const mode = body && SYSTEM[body.mode] ? body.mode : "ask";
  const incoming = Array.isArray(body && body.messages) ? body.messages.slice(-12) : [];
  const messages = incoming
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));

  if (!messages.length || messages[0].role !== "user" || messages[messages.length - 1].role !== "user") {
    return json({ error: "Bad request" }, 400);
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 400,
        system: SYSTEM[mode],
        messages
      })
    });

    if (!upstream.ok) {
      // Keep provider details and credentials out of the public response.
      return json({ error: "The AI provider could not complete the request. Check the API key and provider account." }, 502);
    }

    const result = await upstream.json();
    const reply = (result.content || [])
      .filter(item => item.type === "text")
      .map(item => item.text)
      .join("\n")
      .trim();

    return json({ reply: reply || "Sorry, I could not answer that." });
  } catch {
    return json({ error: "The AI service is temporarily unavailable. Please try again." }, 502);
  }
}
