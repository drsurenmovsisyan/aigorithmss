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

    // Token priority: (1) inline PAT → (2) saved PAT in Clerk metadata → (3) Clerk OAuth
    let githubToken: string | undefined = githubPat?.trim() || undefined;

    if (!githubToken) {
      // Check saved PAT in Clerk private metadata (persistent, works for all clients)
      const user = await client.users.getUser(userId);
      const meta = user.privateMetadata as { githubPat?: string | null };
      githubToken = meta?.githubPat?.trim() || undefined;
    }

    if (!githubToken) {
      // Fall back to Clerk OAuth token
      try {
        const tokens = await client.users.getUserOauthAccessToken(userId, "github");
        githubToken = tokens.data[0]?.token;
      } catch {}
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

    // Set initial status to exporting in Convex
    await convex.mutation(api.system.updateExportStatus, {
      internalKey,
      projectId: projectId as Id<"projects">,
      status: "exporting",
    });

    // Run export directly in the background so it never hangs or depends on Inngest queues
    (async () => {
      try {
        const octokit = new Octokit({ auth: githubToken });

        // Get authenticated user
        const { data: user } = await octokit.rest.users.getAuthenticated();

        // Create the new repository with auto_init
        const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
          name: repoName,
          description: description || `Exported from Aigorithm`,
          private: visibility === "private",
          auto_init: true,
        });

        // Wait for GitHub to initialize the repo
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Get initial commit SHA
        const { data: ref } = await octokit.rest.git.getRef({
          owner: user.login,
          repo: repoName,
          ref: "heads/main",
        });
        const initialCommitSha = ref.object.sha;

        // Fetch all project files
        const files = (await convex.query(api.system.getProjectFilesWithUrls, {
          internalKey,
          projectId: projectId as Id<"projects">,
        })) as FileWithUrl[];

        // Build file map for hierarchy
        const fileMap = new Map<Id<"files">, FileWithUrl>();
        files.forEach((f) => fileMap.set(f._id, f));

        const getFullPath = (file: FileWithUrl): string => {
          if (!file.parentId) return file.name;
          const parent = fileMap.get(file.parentId);
          if (!parent) return file.name;
          return `${getFullPath(parent)}/${file.name}`;
        };

        const fileEntries = files.filter((f) => f.type === "file");
        if (fileEntries.length === 0) {
          throw new Error("No files in project to export");
        }

        const treeItems: {
          path: string;
          mode: "100644";
          type: "blob";
          sha: string;
        }[] = [];

        for (const file of fileEntries) {
          const fullPath = getFullPath(file);
          let content: string;
          let encoding: "utf-8" | "base64" = "utf-8";

          if (file.content !== undefined) {
            content = file.content;
          } else if (file.storageUrl) {
            const response = await ky.get(file.storageUrl);
            const buffer = Buffer.from(await response.arrayBuffer());
            content = buffer.toString("base64");
            encoding = "base64";
          } else {
            continue;
          }

          const { data: blob } = await octokit.rest.git.createBlob({
            owner: user.login,
            repo: repoName,
            content,
            encoding,
          });

          treeItems.push({
            path: fullPath,
            mode: "100644",
            type: "blob",
            sha: blob.sha,
          });
        }

        if (treeItems.length === 0) {
          throw new Error("Failed to create any file blobs");
        }

        // Create the tree
        const { data: tree } = await octokit.rest.git.createTree({
          owner: user.login,
          repo: repoName,
          tree: treeItems,
        });

        // Create commit
        const { data: commit } = await octokit.rest.git.createCommit({
          owner: user.login,
          repo: repoName,
          message: "Initial commit from Aigorithm",
          tree: tree.sha,
          parents: [initialCommitSha],
        });

        // Update branch ref
        await octokit.rest.git.updateRef({
          owner: user.login,
          repo: repoName,
          ref: "heads/main",
          sha: commit.sha,
          force: true,
        });

        // Set status to completed
        await convex.mutation(api.system.updateExportStatus, {
          internalKey,
          projectId: projectId as Id<"projects">,
          status: "completed",
          repoUrl: repo.html_url,
        });
      } catch (err) {
        console.error("Direct export error:", err);
        await convex.mutation(api.system.updateExportStatus, {
          internalKey,
          projectId: projectId as Id<"projects">,
          status: "failed",
        });
      }
    })();

    // Also trigger inngest if available
    try {
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
    } catch {
      // Inngest send warning ignored, direct export is running
    }

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