import { clerkClient } from "@clerk/nextjs/server";
import { convex, getInternalKey } from "@/lib/convex-client";
import { api } from "../../convex/_generated/api";

export const FREE_TIER_MESSAGE_LIMIT = 15;

export type UserAccessResult =
  | { allowed: true; isPaid: boolean; messageCount: number }
  | { allowed: false; status: number; error: string; code?: string };

export async function checkUserAccess(userId: string): Promise<UserAccessResult> {
  const internalKey = getInternalKey();
  if (!internalKey) {
    return {
      allowed: false,
      status: 500,
      error: "Internal key not configured",
    };
  }

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const meta = clerkUser.privateMetadata as {
      blocked?: boolean;
      plan?: "free" | "paid" | "unlimited";
    };

    // 1. Explicitly blocked users (set privateMetadata.blocked = true in Clerk dashboard)
    if (meta?.blocked === true) {
      return {
        allowed: false,
        status: 403,
        error: "Your account has been suspended. Please contact support.",
      };
    }

    // 2. Paid / unlimited plans have unrestricted access
    const isPaid = meta?.plan === "paid" || meta?.plan === "unlimited";

    // 3. Check message count for free users
    const messageCount = await convex.query(api.system.getUserMessageCount, {
      internalKey,
      userId,
    });

    if (!isPaid && messageCount >= FREE_TIER_MESSAGE_LIMIT) {
      return {
        allowed: false,
        status: 402,
        error: `You've reached the free tier limit of ${FREE_TIER_MESSAGE_LIMIT} AI generations. Upgrade your plan to continue building.`,
        code: "FREE_LIMIT_REACHED",
      };
    }

    return { allowed: true, isPaid, messageCount };
  } catch (error) {
    console.error("Error checking user access:", error);
    // If Clerk lookup fails unexpectedly, let the user proceed rather than hard-failing
    return { allowed: true, isPaid: false, messageCount: 0 };
  }
}
