const ALLOWED_ANSWERS = [
  ["Heavy Coding & Virtual Machines", "Gaming", "Video Editing & 3D Rendering", "Office Work & Web Browsing", "Student & Assignments"],
  ["Flagship (no fixed limit)", "Premium ($1,500–$2,500)", "Mid-range ($800–$1,500)", "Budget (under $800)"],
  ["Very important: all-day battery and light weight", "Balanced: average weight and battery", "Low priority: mostly desk use"],
  ["Windows", "macOS", "Linux Friendly", "No preference"],
];

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try {
      const parsed = new URL(origin);
      if (parsed.host !== host && !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
        return res.status(403).json({ error: "Request origin not allowed." });
      }
    } catch {
      return res.status(403).json({ error: "Invalid request origin." });
    }
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "The recommendation service is not configured yet." });

  const answers = req.body && req.body.answers;
  if (!Array.isArray(answers) || answers.length !== ALLOWED_ANSWERS.length ||
      answers.some((answer, index) => typeof answer !== "string" || !ALLOWED_ANSWERS[index].includes(answer))) {
    return res.status(400).json({ error: "Please complete the questionnaire with valid selections." });
  }

  const prompt = [
    "You are a careful laptop research assistant.",
    "Recommend three realistic laptop models matching the user's requirements.",
    "Do not invent current prices, stock status, retailer availability, or specifications. Mark details needing verification.",
    "Explain trade-offs, minimum specifications, upgradeability, warranty considerations, and who each option suits.",
    "Prefer practical value over marketing claims. Ask the user to verify exact model number and regional configuration before purchase.",
    "",
    "Primary use: " + answers[0],
    "Budget: " + answers[1],
    "Battery and portability: " + answers[2],
    "Operating system: " + answers[3],
    "",
    "Respond in concise plain text. Do not return HTML or scripts."
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const headers = {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json",
      "X-Title": "FindMeLaptop"
    };
    const appUrl = process.env.APP_URL || origin;
    if (appUrl) headers["HTTP-Referer"] = appUrl;

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openrouter/free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 4000
      }),
      signal: controller.signal
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("OpenRouter upstream request failed:", upstream.status);
      return res.status(502).json({ error: "The AI provider could not complete the request. Please try again later." });
    }
    const choice = payload.choices?.[0];
    const rawContent = choice?.message?.content;
    const text = typeof rawContent === "string"
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent
            .filter((part) => part && typeof part.text === "string")
            .map((part) => part.text)
            .join("\\n")
        : "";

    if (!text.trim()) {
      console.error("OpenRouter returned no text:", JSON.stringify({
        model: payload.model || "unknown",
        finishReason: choice?.finish_reason || "unknown",
        completionTokens: payload.usage?.completion_tokens,
        reasoningTokens: payload.usage?.completion_tokens_details?.reasoning_tokens,
        hasProviderError: Boolean(payload.error || choice?.error)
      }));
      return res.status(502).json({
        error: "The AI model did not return a text answer. Please try again."
      });
    }
    return res.status(200).json({ text: text.trim() });
  } catch (error) {
    console.error("Recommendation request failed:", error.name || "UnknownError");
    return res.status(504).json({
      error: error.name === "AbortError" ? "The request timed out. Please try again." : "The recommendation service is temporarily unavailable."
    });
  } finally {
    clearTimeout(timeout);
  }
};
