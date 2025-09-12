import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // add in .env
});

export async function analyzeReview(text: string): Promise<{ summary: string; sentiment: string }> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that summarizes book reviews and classifies sentiment as positive, neutral, or negative.",
        },
        {
          role: "user",
          content: `Review: "${text}"\n\nReturn JSON with keys: summary, sentiment.`,
        },
      ],
      temperature: 0.5,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) return { summary: "N/A", sentiment: "neutral" };

    // try to parse JSON safely
    try {
      const parsed = JSON.parse(raw);
      return {
        summary: parsed.summary || "N/A",
        sentiment: parsed.sentiment || "neutral",
      };
    } catch {
      return { summary: raw, sentiment: "neutral" };
    }
  } catch (err: any) {
    console.error("[AI] analyzeReview failed", err.message);
    return { summary: "N/A", sentiment: "neutral" };
  }
}

