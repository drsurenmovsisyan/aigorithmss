import { z } from "zod";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "octokit";
import ky from "ky";

import { inngest } from "@/inngest/client";
import { convex, getInternalKey } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

type FileWithUrl = Doc<"files"> & {
  storageUrl: string | null;
};

const requestSchema = z.object({
  projectId: z.string(),
  repoName: z.string().min(1).max(100),
  visibility: z.enum(["public", "private"]).default("private"),
  description: z.string().max(350).optional(),
  githubPat: z.string().optional(), // One-time inline PAT (used during first connect)
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, repoName, visibility, description, githubPat } = requestSchema.parse(body);

    const client = await clerkClient();

    // Token priority: (1) Clerk OAuth (via Login with GitHub) → (2) saved PAT fallback → (3) inline PAT
    let githubToken: string | undefined;

    // Primary: Clerk OAuth token from GitHub social connection
    try {
      const tokens = await client.users.getUserOauthAccessToken(userId, "github");
      githubToken = tokens.data[0]?.token;
    } catch {}

    if (!githubToken) {
      // Fallback: saved PAT in Clerk private metadata (legacy)
      const user = await client.users.getUser(userId);
      const meta = user.privateMetadata as { githubPat?: string | null };
      githubToken = meta?.githubPat?.trim() || undefined;
    }

    if (!githubToken && githubPat?.trim()) {
      // Last resort: inline PAT passed in request body
      githubToken = githubPat.trim();
    }

    if (!githubToken) {
      return NextResponse.json(
        { error: "GitHub not connected. Please connect your GitHub account in the Export settings." },
        { status: 400 }
      );
    }

    const internalKey = getInternalKey();

    if (!internalKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Set status to exporting immediately — UI shows spinner right away
    await convex.mutation(api.system.updateExportStatus, {
      internalKey,
      projectId: projectId as Id<"projects">,
      status: "exporting",
    });

    // Hand off to Inngest for reliable background processing
    // (background IIFE gets killed by Vercel after the response returns)
    await inngest.send({
      name: "github/export.repo",
      data: {
        projectId,
        repoName,
        visibility,
        description,
        githubToken,
        internalKey,
      },
    });

    return NextResponse.json({ 
      success: true, 
      projectId,
    });
  } catch (error) {
    console.error("Export endpoint error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to export repository" },
      { status: 500 }
    );
  }
}