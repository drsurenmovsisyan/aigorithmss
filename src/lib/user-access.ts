import { clerkClient } from "@clerk/nextjs/server";
import { convex, getInternalKey } from "@/lib/convex-client";
import { api } from "../../convex/_generated/api";

export const FREE_TIER_CREDITS = 0;
export const PAID_TIER_CREDITS = 1;

export type UserAccessResult =
  | { allowed: true; isPaid: boolean; messageCount: number; maxCredits: number }
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
      credits?: number;
    };

    // 1. Explicitly blocked users (set privateMetadata.blocked = true in Clerk dashboard)
    if (meta?.blocked === true) {
      return {
        allowed: false,
        status: 403,
        error: "Your account has been suspended. Please contact support.",
      };
    }

    // 2. Determine credit allowance
    // - "unlimited": no limit
    // - custom "credits" number in metadata: overrides default
    // - "paid": 1 credit
    // - default / "free": 0 credits
    let maxCredits = FREE_TIER_CREDITS;
    const isPaid = meta?.plan === "paid" || meta?.plan === "unlimited";

    if (meta?.plan === "unlimited") {
      maxCredits = Infinity;
    } else if (typeof meta?.credits === "number") {
      maxCredits = meta.credits;
    } else if (meta?.plan === "paid") {
      maxCredits = PAID_TIER_CREDITS;
    }

    // Unlimited users bypass count check
    if (maxCredits === Infinity) {
      return { allowed: true, isPaid: true, messageCount: 0, maxCredits: Infinity };
    }

    // 3. Query current message count across all projects
    const messageCount = await convex.query(api.system.getUserMessageCount, {
      internalKey,
      userId,
    });

    if (messageCount >= maxCredits) {
      if (maxCredits === 0) {
        return {
          allowed: false,
          status: 402,
          error: "Free accounts have 0 credits. Please upgrade your plan to start building.",
          code: "NO_CREDITS",
        };
      }
      return {
        allowed: false,
        status: 402,
        error: `You have used your ${maxCredits} credit${maxCredits === 1 ? "" : "s"}. Please upgrade or contact support to add more credits.`,
        code: "CREDIT_LIMIT_REACHED",
      };
    }

    return { allowed: true, isPaid, messageCount, maxCredits };
  } catch (error) {
    console.error("Error checking user access:", error);
    // If Clerk lookup fails unexpectedly, reject free access safely
    return {
      allowed: false,
      status: 500,
      error: "Unable to verify account credits. Please try again.",
    };
  }
}
