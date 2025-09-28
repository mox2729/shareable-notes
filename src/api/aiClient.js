// /api/openai.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { mode, text } = req.body || {};
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

    const promptMap = {
      summarize: `Summarize this note in 1-2 lines:\n\n${text}`,
      tags: `Suggest 3-6 short tags (comma-separated) for this note:\n\n${text}`,
      grammar: `Return JSON array of grammar issues with startIndex, endIndex, suggestion for this text:\n\n${text}`,
      terms: `Return 6 key terms (comma-separated) from this text:\n\n${text}`
    };
    const prompt = promptMap[mode] ?? promptMap.summarize;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: prompt,
        max_output_tokens: 500
      }),
    });

    const data = await r.json();
    return res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
// src/api/aiClient.js
export async function callAi(mode, text) {
  const resp = await fetch("/api/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, text }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error || "AI request failed");
  }
  return resp.json(); // returns { data }
}
