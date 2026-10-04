import { z } from "zod";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "octokit";

const requestSchema = z.object({
  githubPat: z.string().min(1, "Token is required"),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { githubPat } = requestSchema.parse(body);
    const token = githubPat.trim();

    // Validate the token with GitHub before saving
    try {
      const octokit = new Octokit({ auth: token });
      const { data: ghUser } = await octokit.rest.users.getAuthenticated();

      // Save token to Clerk private metadata (server-side only, never exposed to client)
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        privateMetadata: {
          githubPat: token,
          githubLogin: ghUser.login,
          githubConnectedAt: new Date().toISOString(),
        },
      });

      return NextResponse.json({
        success: true,
        login: ghUser.login,
        avatarUrl: ghUser.avatar_url,
      });
    } catch {
      return NextResponse.json(
        { error: "Invalid GitHub token. Make sure it has 'repo' scope." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("GitHub connect error:", error);
    return NextResponse.json(
      { error: "Failed to connect GitHub account" },
      { status: 500 }
    );
  }
}
