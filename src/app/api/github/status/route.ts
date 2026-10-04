import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const meta = user.privateMetadata as {
      githubPat?: string | null;
      githubLogin?: string | null;
      githubConnectedAt?: string | null;
    };

    if (meta?.githubPat) {
      return NextResponse.json({
        connected: true,
        method: "pat",
        login: meta.githubLogin ?? null,
        connectedAt: meta.githubConnectedAt ?? null,
      });
    }

    // Check Clerk OAuth as fallback
    try {
      const tokens = await client.users.getUserOauthAccessToken(userId, "github");
      if (tokens.data[0]?.token) {
        return NextResponse.json({
          connected: true,
          method: "oauth",
          login: null,
          connectedAt: null,
        });
      }
    } catch {}

    return NextResponse.json({ connected: false });
  } catch (error) {
    console.error("GitHub status error:", error);
    return NextResponse.json({ connected: false });
  }
}
