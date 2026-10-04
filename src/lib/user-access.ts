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

    // 2. Check Clerk Billing subscription for active paid plans (e.g. Pro)
    let isBillingPaid = false;
    let isBillingUnlimited = false;
    let billingPeriodStart: number | undefined = undefined;

    try {
      if (client.billing && typeof client.billing.getUserBillingSubscription === "function") {
        const billingSub = await client.billing.getUserBillingSubscription(userId);
        const activeItems = (billingSub.subscriptionItems ?? []).filter(
          (item) => item.status === "active"
        );
        for (const item of activeItems) {
          const slug = item.plan?.slug?.toLowerCase();
          const name = item.plan?.name?.toLowerCase();
          if (slug === "unlimited" || name === "unlimited") {
            isBillingUnlimited = true;
            isBillingPaid = true;
            billingPeriodStart = item.periodStart ?? undefined;
          } else if (
            slug === "pro" ||
            slug === "paid" ||
            name === "pro" ||
            (item.plan?.fee && item.plan.fee.amount > 0) ||
            (slug && slug !== "free_user" && slug !== "free")
          ) {
            isBillingPaid = true;
            // Track when this billing period started so we only count messages since then
            billingPeriodStart = item.periodStart ?? undefined;
          }
        }
      }
    } catch (billingError) {
      console.warn("Could not check Clerk billing subscription:", billingError);
    }

    // 3. Determine credit allowance
    // - "unlimited": no limit
    // - custom "credits" number in metadata: overrides default
    // - "paid" / active Clerk billing plan: PAID_TIER_CREDITS
    // - default / "free": 0 credits
    const isPaid = meta?.plan === "paid" || meta?.plan === "unlimited" || isBillingPaid;
    const isUnlimited = meta?.plan === "unlimited" || isBillingUnlimited;

    let maxCredits = FREE_TIER_CREDITS;

    if (isUnlimited) {
      maxCredits = Infinity;
    } else if (typeof meta?.credits === "number") {
      maxCredits = meta.credits;
    } else if (isPaid) {
      maxCredits = PAID_TIER_CREDITS;
    }

    // Unlimited users bypass count check
    if (maxCredits === Infinity) {
      return { allowed: true, isPaid: true, messageCount: 0, maxCredits: Infinity };
    }

    // 3. Query current message count across all projects
    // For paid billing users, only count messages from the current billing period (periodStart)
    // so that pre-upgrade messages don't consume the paid credit allowance
    const countFrom = isBillingPaid ? billingPeriodStart : undefined;
    const messageCount = await convex.query(api.system.getUserMessageCount, {
      internalKey,
      userId,
      ...(countFrom !== undefined ? { countFrom } : {}),
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
