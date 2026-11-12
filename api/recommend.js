const ALLOWED_ANSWERS = [
  [
    "Heavy Coding & Virtual Machines",
    "Gaming",
    "Video Editing & 3D Rendering",
    "Office Work & Web Browsing",
    "Student & Assignments",
  ],
  [
    "Flagship (no fixed limit)",
    "Premium ($1,500–$2,500)",
    "Mid-range ($800–$1,500)",
    "Budget (under $800)",
  ],
  [
    "Very important: all-day battery and light weight",
    "Balanced: average weight and battery",
    "Low priority: mostly desk use",
  ],
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
      const originUrl = new URL(origin);
      const isLocal = ["localhost", "127.0.0.1"].includes(originUrl.hostname);
      if (originUrl.host !== host && !isLocal) {
        return res.status(403).json({ error: "Request origin not allowed." });
      }
    } catch {
      return res.status(403).json({ error: "Invalid request origin." });
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "The recommendation service is not configured yet. Please try again later.",
    });
  }

  const answers = req.body && req.body.answers;
  if (
    !Array.isArray(answers) ||
    answers.length !== ALLOWED_ANSWERS.length ||
    answers.some((answer, index) =>
      typeof answer !== "string" || !ALLOWED_ANSWERS[index].includes(answer)
    )
  ) {
    return res.status(400).json({ error: "Please complete the questionnaire with valid selections." });
  }

  const prompt = [
    "You are a careful laptop research assistant.",
    "Recommend three realistic laptop models that best match the user's requirements.",
    "Do not invent current prices, stock status, retailer availability, or specifications.",
    "If exact current market data is unavailable, clearly label prices and availability as needing verification.",
    "Explain the trade-offs, minimum recommended specifications, upgradeability, warranty considerations, and who each option suits.",
    "Prefer practical value over marketing claims. Ask the user to verify the exact model number and regional configuration before purchase.",
    "",
    "User requirements:",
    "Primary use: " + answers[0],
    "Budget: " + answers[1],
    "Battery and portability: " + answers[2],
    "Operating system: " + answers[3],
    "",
    "Respond in concise, readable plain text. Do not return HTML or scripts.",
  ].join("\n");

  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const upstream = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" +
        encodeURIComponent(model) +
        ":generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1400,
          },
        }),
        signal: controller.signal,
      }
    );

    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("Gemini upstream request failed with status:", upstream.status);
      return res.status(502).json({
        error: "The AI provider could not complete the request. Please try again later.",
      });
    }

    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      return res.status(502).json({
        error: "The AI provider returned no recommendations. Please try again.",
      });
    }

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Recommendation request failed:", error.name || "UnknownError");
    return res.status(504).json({
      error: error.name === "AbortError"
        ? "The request timed out. Please try again."
        : "The recommendation service is temporarily unavailable.",
    });
  } finally {
    clearTimeout(timeout);
  }
};
