"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import TextAreaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import ky, { HTTPError } from "ky";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PROJECT_TEMPLATES } from "../../constants";
import { UsageBar } from "@/components/usage-bar";

export const ProjectForm = () => {
  const router = useRouter();
  const clerk = useClerk();
  const { isSignedIn, isLoaded } = useUser();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Resume submission if user had to sign in first
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const pendingPrompt = sessionStorage.getItem("pending_prompt");
    if (pendingPrompt) {
      sessionStorage.removeItem("pending_prompt");
      setValue(pendingPrompt);
      handleCreate(pendingPrompt);
    }
  }, [isLoaded, isSignedIn]);

  const handleCreate = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed) return;

    if (!isSignedIn) {
      sessionStorage.setItem("pending_prompt", trimmed);
      clerk.openSignIn();
      return;
    }

    setIsPending(true);

    try {
      const { projectId } = await ky
        .post("/api/projects/create-with-prompt", {
          json: { prompt: trimmed },
        })
        .json<{ projectId: string }>();

      toast.success("Project created");
      router.push(`/projects/${projectId}`);
    } catch (error) {
      if (error instanceof HTTPError) {
        try {
          const body = await error.response.json<{ error?: string }>();
          if (body?.error) {
            toast.error(body.error);
            return;
          }
        } catch {}
      }
      toast.error(error instanceof Error ? error.message : "Unable to create project");
    } finally {
      setIsPending(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreate(value);
  };

  const onSelect = (prompt: string) => {
    setValue(prompt);
  };

  const isButtonDisabled = isPending || !value.trim();

  return (
    <section className="space-y-6">
      <form
        onSubmit={onSubmit}
        className={cn(
          "relative border border-[#e4e2db] p-4 pt-1 rounded-xl bg-[#f7f6f0] dark:bg-sidebar transition-all text-left",
          isFocused && "shadow-xs border-gray-400"
        )}
      >
        <TextAreaAutosize
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isPending}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          minRows={2}
          maxRows={8}
          className="pt-4 resize-none border-none w-full outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 text-sm md:text-base leading-relaxed"
          placeholder="What would you like to build?"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
        />
        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-300 bg-white/70 dark:bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp;to submit
          </div>
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={cn(
              "size-8 rounded-full flex items-center justify-center transition-all",
              isButtonDisabled
                ? "bg-gray-300 dark:bg-muted text-gray-500 cursor-not-allowed border border-gray-300/50"
                : "bg-[#c2410c] hover:bg-[#a1360a] text-white shadow-xs cursor-pointer active:scale-95"
            )}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin text-white" />
            ) : (
              <ArrowUpIcon className="size-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </form>

      {/* Credit usage indicator */}
      <div className="flex justify-center">
        <UsageBar variant="inline" />
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
        {PROJECT_TEMPLATES.map((template) => (
          <Button
            key={template.title}
            type="button"
            variant="outline"
            size="sm"
            className="bg-white dark:bg-sidebar text-gray-800 dark:text-gray-200 border-gray-200 hover:bg-gray-50 dark:hover:bg-sidebar/80 shadow-2xs text-xs md:text-sm font-medium transition-all"
            onClick={() => onSelect(template.prompt)}
          >
            <span>{template.emoji}</span>
            <span>{template.title}</span>
          </Button>
        ))}
      </div>
    </section>
  );
};
