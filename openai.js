// /api/openai.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST" });
  try {
    const { mode, text } = req.body || {};
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

    const promptMap = {
      summarize: `Summarize this note in 1-2 lines:\n\n${text}`,
      tags: `Suggest 3-6 short tags (comma-separated) for this note:\n\n${text}`,
      grammar: `Return a JSON array of grammar issues with fields: startIndex, endIndex, suggestion for this text:\n\n${text}`,
      terms: `Return 6 key terms (comma-separated) present in this text:\n\n${text}`
    };
    const prompt = promptMap[mode] ?? promptMap.summarize;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // pick based on your account/cost goals
        input: prompt,
        max_output_tokens: 500
      }),
    });

    const data = await r.json();
    // Return raw response so client can parse it per your schema
    return res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "server error" });
  }
}
