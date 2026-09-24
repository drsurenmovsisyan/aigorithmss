import { generateText } from "ai";
import { inngest } from "./client";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { firecrawl } from "@/lib/firecrawl";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const URL_REGEX = /https?:\/\/[^\s]+/g;

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ event, step }) => {
    const { prompt } = event.data as { prompt: string };

    const urls = await step.run("extract-urls", async () => {
      return prompt.match(URL_REGEX) ?? [];
    }) as string[];

    const scrapedContent = await step.run("scrape-urls", async () => {
      const results = await Promise.all(
        urls.map(async (url) => {
          const result = await firecrawl.scrapeUrl(
            url,
            { formats: ["markdown"] }
          );
          return result.success && result.markdown ? result.markdown : null;
        })
      )
      return results.filter(Boolean).join("\n\n");
    });

    const finalPrompt = scrapedContent
  ? `Context:\n${scrapedContent}\n\nQuestion: ${prompt}`
  : prompt;

    await step.run("generate-text", async () => {
     return  await generateText({
    model: openrouter('anthropic/claude-3-haiku'), 
    prompt: finalPrompt,
    experimental_telemetry: {
      isEnabled: true,
      recordInputs: true,
      recordOutputs: true,
    },
  });
    })
  },
);

export const demoError = inngest.createFunction(
  { id: "demo-error" },
  { event: "demo/error" },
  async ({ step }) => {
    await step.run("fail", async () => {
    throw new Error("Inngest Error: Background job failed!");
    });
  }
);