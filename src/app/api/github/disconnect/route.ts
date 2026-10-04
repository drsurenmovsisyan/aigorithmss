import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        githubPat: null,
        githubLogin: null,
        githubConnectedAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GitHub disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect GitHub account" },
      { status: 500 }
    );
  }
}
