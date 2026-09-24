import { generateText, tool, stepCountIs } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex, getInternalKey } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import { 
  CODING_AGENT_SYSTEM_PROMPT, 
  TITLE_GENERATOR_SYSTEM_PROMPT
} from "./constants";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";

// ─── Tool handlers (direct Convex calls, no agent-kit dependency) ────────────

async function listFiles(projectId: Id<"projects">, internalKey: string) {
  const files = await convex.query(api.system.getProjectFiles, {
    internalKey,
    projectId,
  });
  const sorted = files.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return JSON.stringify(sorted.map((f) => ({
    id: f._id,
    name: f.name,
    type: f.type,
    parentId: f.parentId ?? null,
  })));
}

async function readFile(fileId: string, internalKey: string) {
  const file = await convex.query(api.system.getFileById, {
    internalKey,
    fileId: fileId as Id<"files">,
  });
  if (!file) return `Error: File "${fileId}" not found.`;
  if (file.type === "folder") return `Error: "${fileId}" is a folder.`;
  return JSON.stringify({ name: file.name, content: file.content ?? "" });
}

async function updateFile(fileId: string, content: string, internalKey: string) {
  const file = await convex.query(api.system.getFileById, {
    internalKey,
    fileId: fileId as Id<"files">,
  });
  if (!file) return `Error: File "${fileId}" not found. Use listFiles first.`;
  if (file.type === "folder") return `Error: "${fileId}" is a folder.`;
  await convex.mutation(api.system.updateFile, {
    internalKey,
    fileId: fileId as Id<"files">,
    content,
  });
  return `File "${file.name}" updated successfully.`;
}

async function createFile(
  name: string,
  content: string,
  parentId: string | null,
  projectId: Id<"projects">,
  internalKey: string
) {
  await convex.mutation(api.system.createFile, {
    internalKey,
    projectId,
    name,
    content,
    parentId: (parentId ?? undefined) as Id<"files"> | undefined,
  });
  return `File "${name}" created successfully.`;
}

async function createFolder(
  name: string,
  parentId: string | null,
  projectId: Id<"projects">,
  internalKey: string
) {
  await convex.mutation(api.system.createFolder, {
    internalKey,
    projectId,
    name,
    parentId: (parentId ?? undefined) as Id<"files"> | undefined,
  });
  return `Folder "${name}" created successfully.`;
}

async function renameFile(fileId: string, newName: string, internalKey: string) {
  await convex.mutation(api.system.renameFile, {
    internalKey,
    fileId: fileId as Id<"files">,
    newName,
  });
  return `Renamed to "${newName}" successfully.`;
}

async function deleteFiles(fileIds: string[], internalKey: string) {
  for (const fileId of fileIds) {
    await convex.mutation(api.system.deleteFile, {
      internalKey,
      fileId: fileId as Id<"files">,
    });
  }
  return `Deleted ${fileIds.length} item(s) successfully.`;
}

async function scrapeUrl(url: string) {
  try {
    const { firecrawl } = await import("@/lib/firecrawl");
    const result = await firecrawl.scrapeUrl(url, { formats: ["markdown"] });
    if (result.success && result.markdown) {
      return result.markdown.slice(0, 8000);
    }
    return `Could not scrape ${url}`;
  } catch {
    return `Error scraping ${url}`;
  }
}

// ─── Main Inngest function ───────────────────────────────────────────────────

interface MessageEvent {
  messageId: Id<"messages">;
  conversationId: Id<"conversations">;
  projectId: Id<"projects">;
  message: string;
  modelId: string;
}

export const processMessage = inngest.createFunction(
  {
    id: "process-message",
    cancelOn: [
      {
        event: "message/cancel",
        if: "event.data.messageId == async.data.messageId",
      },
    ],
    onFailure: async ({ event, step }) => {
      const { messageId } = event.data.event.data as MessageEvent;
      const internalKey = getInternalKey();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawError: any = event.data.error;
      const errorDetail = rawError?.message || (typeof rawError === "string" ? rawError : "An unexpected error occurred");

      console.error("[Inngest] process-message failure:", rawError);

      if (internalKey) {
        await step.run("update-message-on-failure", async () => {
          await convex.mutation(api.system.updateMessageContent, {
            internalKey,
            messageId,
            content: `I encountered an error while processing your request:\n\n> ${errorDetail}\n\n*If this mentions an API key or authentication, please verify that \`OPENROUTER_API_KEY\` is added to your Vercel Environment Variables.*`,
          });
        });
      }
    }
  },
  { event: "message/sent" },
  async ({ event, step }) => {
    const { 
      messageId, 
      conversationId,
      projectId,
      message,
      modelId,
    } = event.data as MessageEvent;

    const effectiveModelId =
      modelId && typeof modelId === "string" && modelId.trim()
        ? modelId.trim()
        : "anthropic/claude-3-haiku";

    const internalKey = getInternalKey();
    if (!internalKey) {
      throw new NonRetriableError("Internal key is not configured");
    }

    if (!process.env.OPENROUTER_API_KEY) {
      throw new NonRetriableError("OPENROUTER_API_KEY is not configured in environment variables");
    }

    await step.sleep("wait-for-db-sync", "1s");

    // ── Fetch conversation & recent messages ──
    const conversation = await step.run("get-conversation", async () => {
      return await convex.query(api.system.getConversationById, {
        internalKey,
        conversationId,
      });
    });

    if (!conversation) {
      throw new NonRetriableError("Conversation not found");
    }

    const recentMessages = await step.run("get-recent-messages", async () => {
      return await convex.query(api.system.getRecentMessages, {
        internalKey,
        conversationId,
        limit: 10,
      });
    });

    // ── Build system prompt with history ──
    let systemPrompt = CODING_AGENT_SYSTEM_PROMPT;
    const contextMessages = recentMessages.filter(
      (msg) => msg._id !== messageId && msg.content.trim() !== ""
    );
    if (contextMessages.length > 0) {
      const historyText = contextMessages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n\n");
      systemPrompt += `\n\n## Previous Conversation (for context only):\n${historyText}\n\n## Current Request:\nRespond ONLY to the user's new message below.`;
    }

    // ── OpenRouter client ──
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // ── Generate title if needed ──
    const shouldGenerateTitle =
      conversation.title === DEFAULT_CONVERSATION_TITLE;

    if (shouldGenerateTitle) {
      const titleResult = await step.run("generate-title", async () => {
        const result = await generateText({
          model: openrouter(effectiveModelId),
          system: TITLE_GENERATOR_SYSTEM_PROMPT,
          prompt: message,
          maxOutputTokens: 50,
          temperature: 0,
        });
        return result.text.trim();
      });

      if (titleResult) {
        await step.run("update-conversation-title", async () => {
          await convex.mutation(api.system.updateConversationTitle, {
            internalKey,
            conversationId,
            title: titleResult,
          });
        });
      }
    }

    // ── Agentic tool-calling loop ──
    // Define Vercel AI SDK tools
    const tools = {
      listFiles: tool({
        description: "List all files and folders in the project. Returns names, IDs, types, and parentId. Items with parentId: null are at root level.",
        inputSchema: z.object({}),
        execute: async () => listFiles(projectId, internalKey),
      }),
      readFile: tool({
        description: "Read the content of a file by its ID.",
        inputSchema: z.object({
          fileId: z.string().describe("The ID of the file to read"),
        }),
        execute: async ({ fileId }: { fileId: string }) => readFile(fileId, internalKey),
      }),
      updateFile: tool({
        description: "Update the content of an existing file.",
        inputSchema: z.object({
          fileId: z.string().describe("The ID of the file to update"),
          content: z.string().describe("The new full content for the file"),
        }),
        execute: async ({ fileId, content }: { fileId: string; content: string }) => updateFile(fileId, content, internalKey),
      }),
      createFile: tool({
        description: "Create a new file in the project.",
        inputSchema: z.object({
          name: z.string().describe("File name including extension (e.g. index.html)"),
          content: z.string().describe("Initial content of the file"),
          parentId: z.string().nullable().optional().describe("Parent folder ID, or null/omitted for root"),
        }),
        execute: async ({ name, content, parentId }: { name: string; content: string; parentId?: string | null }) =>
          createFile(name, content, parentId ?? null, projectId, internalKey),
      }),
      createFolder: tool({
        description: "Create a new folder in the project.",
        inputSchema: z.object({
          name: z.string().describe("Folder name"),
          parentId: z.string().nullable().optional().describe("Parent folder ID, or null/omitted for root"),
        }),
        execute: async ({ name, parentId }: { name: string; parentId?: string | null }) =>
          createFolder(name, parentId ?? null, projectId, internalKey),
      }),
      renameFile: tool({
        description: "Rename a file or folder.",
        inputSchema: z.object({
          fileId: z.string().describe("The ID of the file or folder to rename"),
          newName: z.string().describe("The new name"),
        }),
        execute: async ({ fileId, newName }: { fileId: string; newName: string }) => renameFile(fileId, newName, internalKey),
      }),
      deleteFiles: tool({
        description: "Delete one or more files or folders by their IDs.",
        inputSchema: z.object({
          fileIds: z.array(z.string()).describe("Array of file/folder IDs to delete"),
        }),
        execute: async ({ fileIds }: { fileIds: string[] }) => deleteFiles(fileIds, internalKey),
      }),
      scrapeUrl: tool({
        description: "Scrape the content of a URL and return it as markdown. Useful for fetching documentation or reference material.",
        inputSchema: z.object({
          url: z.string().describe("The URL to scrape"),
        }),
        execute: async ({ url }: { url: string }) => scrapeUrl(url),
      }),
    };

    // Run the agentic loop inside a single step.run (durable, retryable)
    const assistantResponse = await step.run("run-agent", async () => {
      const result = await generateText({
        model: openrouter(effectiveModelId),
        system: systemPrompt,
        prompt: message,
        tools,
        stopWhen: stepCountIs(20),
        temperature: 0.3,
        maxOutputTokens: 16000,
      });

      // Return the final text response
      return result.text || "I processed your request. Let me know if you need anything else!";
    });

    // ── Save the assistant response ──
    await step.run("update-assistant-message", async () => {
      await convex.mutation(api.system.updateMessageContent, {
        internalKey,
        messageId,
        content: assistantResponse,
      });
    });

    return { success: true, messageId, conversationId };
  }
);
