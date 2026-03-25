import { getAnthropicClient } from "./client";

export async function writeNewsletterIntro(
  topHeadline: string,
  themeNames: string[],
  language: "en" | "pt-BR"
): Promise<string> {
  const client = getAnthropicClient();

  const langInstruction =
    language === "pt-BR"
      ? "Write in Brazilian Portuguese. Use a friendly, warm tone."
      : "Write in English. Use a friendly, warm tone.";

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20241022",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Write a brief, engaging newsletter introduction (3-4 sentences) for today's edition of "NewDandasLetter".

${langInstruction}

Today's themes: ${themeNames.join(", ")}
Top story: "${topHeadline}"

The intro should feel like a knowledgeable friend briefly setting the scene for today's news. Don't use greetings like "Dear reader". Be direct and interesting. Return ONLY the intro text, no quotes or labels.`,
      },
    ],
  });

  return response.content[0].type === "text"
    ? response.content[0].text.trim()
    : "Here are today's top stories.";
}
