import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkUserAccess } from "@/lib/user-access";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await checkUserAccess(userId);

  if (!access.allowed) {
    // Even when blocked we still want to surface usage info if possible
    if ("status" in access && access.status === 402) {
      // We can still try to get the data — re-run a soft check
      // For 402 (credit limit) we know maxCredits and can derive remaining = 0
      const maxCredits =
        "error" in access && access.code === "NO_CREDITS" ? 0 : null;
      return NextResponse.json({
        isPaid: false,
        messageCount: maxCredits ?? 0,
        maxCredits: maxCredits ?? 0,
        remainingCredits: 0,
      });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { isPaid, messageCount, maxCredits } = access;
  const isUnlimited = maxCredits === Infinity;
  const remainingCredits = isUnlimited ? Infinity : Math.max(0, maxCredits - messageCount);

  return NextResponse.json({
    isPaid,
    messageCount,
    maxCredits: isUnlimited ? null : maxCredits, // null = unlimited
    remainingCredits: isUnlimited ? null : remainingCredits,
  });
}
