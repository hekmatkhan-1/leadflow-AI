// TODO: OpenAI client configuration and helper functions
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatResponse(
  messages: OpenAI.ChatCompletionMessageParam[]
) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function scoreLead(conversationText: string) {
  // TODO: Implement lead scoring with OpenAI
  const prompt = `Score this lead conversation from 0-100...`;
  return { score: 0, reasoning: "" };
}
