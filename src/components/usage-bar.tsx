"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CrownIcon, ZapIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UsageData {
  isPaid: boolean;
  messageCount: number;
  maxCredits: number | null; // null = unlimited
  remainingCredits: number | null; // null = unlimited
}

interface UsageBarProps {
  /** Layout variant — "sidebar" shows inside the conversation panel, "inline" for compact display */
  variant?: "sidebar" | "inline";
}

export const UsageBar = ({ variant = "sidebar" }: UsageBarProps) => {
  const { isSignedIn } = useUser();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/usage");
        if (res.ok) {
          const data = await res.json();
          setUsage(data);
        }
      } catch {
        // silently fail — don't block UI
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [isSignedIn]);

  if (!isSignedIn || loading || !usage) return null;

  const isUnlimited = usage.maxCredits === null;
  const remaining = isUnlimited ? null : (usage.remainingCredits ?? 0);
  const total = isUnlimited ? null : (usage.maxCredits ?? 0);
  const used = isUnlimited ? null : (usage.messageCount ?? 0);
  const pct = total ? Math.min(100, ((used ?? 0) / total) * 100) : 0;
  const isCritical = !isUnlimited && (remaining ?? 0) === 0;
  const isLow = !isUnlimited && !isCritical && (remaining ?? 1) <= Math.ceil((total ?? 1) * 0.2);

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {isUnlimited ? (
          <span className="flex items-center gap-1 text-emerald-500 font-medium">
            <ZapIcon className="size-3" />
            Unlimited
          </span>
        ) : (
          <span className={cn(isCritical && "text-red-500 font-medium", isLow && "text-amber-500 font-medium")}>
            {remaining} / {total} credit{total !== 1 ? "s" : ""} remaining
          </span>
        )}
        {!usage.isPaid && (
          <Button asChild size="sm" variant="outline" className="h-6 px-2 text-[11px] gap-1 ml-1">
            <Link href="/pricing">
              <CrownIcon className="size-3" />
              Upgrade
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // sidebar variant
  return (
    <div className="border-t bg-sidebar px-3 py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {isUnlimited ? (
            <ZapIcon className="size-3.5 text-emerald-500" />
          ) : (
            <ZapIcon className={cn(
              "size-3.5",
              isCritical ? "text-red-400" : isLow ? "text-amber-400" : "text-muted-foreground"
            )} />
          )}
          <span className="text-[11px] font-medium text-foreground">
            {usage.isPaid ? "Pro" : "Free"} plan
          </span>
        </div>
        <span className={cn(
          "text-[11px] tabular-nums",
          isUnlimited
            ? "text-emerald-500 font-medium"
            : isCritical
              ? "text-red-400 font-medium"
              : isLow
                ? "text-amber-400 font-medium"
                : "text-muted-foreground"
        )}>
          {isUnlimited ? "∞ unlimited" : `${remaining} of ${total} remaining`}
        </span>
      </div>

      {!isUnlimited && (
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isCritical
                ? "bg-red-400"
                : isLow
                  ? "bg-amber-400"
                  : "bg-emerald-500"
            )}
            style={{ width: `${100 - pct}%` }}
          />
        </div>
      )}

      {!usage.isPaid && (
        <div className="mt-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full h-7 text-[11px] gap-1.5 bg-background hover:bg-accent"
          >
            <Link href="/pricing">
              <CrownIcon className="size-3" />
              Upgrade to Pro
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
