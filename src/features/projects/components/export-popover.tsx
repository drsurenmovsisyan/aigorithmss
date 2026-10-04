import React, { useState, useEffect, useCallback } from "react";
import ky, { HTTPError } from "ky";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { FaGithub } from "react-icons/fa";
import {
  CheckCheckIcon,
  CheckCircle2Icon,
  DownloadIcon,
  ExternalLinkIcon,
  FolderArchiveIcon,
  KeyRoundIcon,
  Loader2Icon,
  LoaderIcon,
  ShieldCheckIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react";
import JSZip from "jszip";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useProject } from "../hooks/use-projects";
import { useFiles } from "../hooks/use-files";
import { Id, Doc } from "../../../../convex/_generated/dataModel";

const formSchema = z.object({
  repoName: z
    .string()
    .min(1, "Repository name is required")
    .max(100, "Repository name is too long")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Only alphanumeric characters, hyphens, underscores, and dots are allowed"
    ),
  visibility: z.enum(["public", "private"]),
  description: z.string().max(350, "Description is too long"),
});

interface GitHubStatus {
  connected: boolean;
  method?: "pat" | "oauth";
  login?: string | null;
  connectedAt?: string | null;
}

interface ExportPopoverProps {
  projectId: Id<"projects">;
}

export const ExportPopover = ({ projectId }: ExportPopoverProps) => {
  const project = useProject(projectId);
  const files = useFiles(projectId);

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"github" | "zip">("github");
  const [isZipping, setIsZipping] = useState(false);

  // GitHub connection state
  const [ghStatus, setGhStatus] = useState<GitHubStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [patInput, setPatInput] = useState("");
  const [showConnect, setShowConnect] = useState(false);

  const exportStatus = project?.exportStatus;
  const exportRepoUrl = project?.exportRepoUrl;

  const fetchGitHubStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const data = await ky.get("/api/github/status").json<GitHubStatus>();
      setGhStatus(data);
    } catch {
      setGhStatus({ connected: false });
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  // Load status when popover opens
  useEffect(() => {
    if (open) {
      fetchGitHubStatus();
    }
  }, [open, fetchGitHubStatus]);

  const handleConnectGitHub = async () => {
    if (!patInput.trim()) return;
    setIsConnecting(true);
    try {
      const data = await ky
        .post("/api/github/connect", { json: { githubPat: patInput.trim() } })
        .json<{ success: boolean; login: string }>();

      toast.success(`GitHub connected as @${data.login}`, {
        description: "Your token is saved — export will work automatically from now on.",
      });
      setPatInput("");
      setShowConnect(false);
      await fetchGitHubStatus();
    } catch (error) {
      if (error instanceof HTTPError) {
        try {
          const body = await error.response.json<{ error: string }>();
          toast.error(body.error ?? "Failed to connect GitHub");
          return;
        } catch {}
      }
      toast.error("Failed to connect GitHub account");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    setIsDisconnecting(true);
    try {
      await ky.post("/api/github/disconnect");
      toast.success("GitHub disconnected");
      setGhStatus({ connected: false });
    } catch {
      toast.error("Failed to disconnect GitHub");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const form = useForm({
    defaultValues: {
      repoName: project?.name?.replace(/[^a-zA-Z0-9._-]/g, "-") ?? "",
      visibility: "private" as "public" | "private",
      description: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!ghStatus?.connected) {
        toast.error("Connect your GitHub account first");
        setShowConnect(true);
        return;
      }
      try {
        await ky.post("/api/github/export", {
          json: {
            projectId,
            repoName: value.repoName,
            visibility: value.visibility,
            description: value.description || undefined,
          },
        });
        toast.success("Export started! Check back in a moment.");
      } catch (error) {
        if (error instanceof HTTPError) {
          try {
            const body = await error.response.json<{ error: string }>();
            if (body.error?.includes("GitHub not connected")) {
              setGhStatus({ connected: false });
              setShowConnect(true);
              toast.error("GitHub connection lost — please reconnect");
              return;
            }
            if (body.error) {
              toast.error(body.error);
              return;
            }
          } catch {}
        }
        toast.error("Unable to export repository");
      }
    },
  });

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);

      if (!files || files.length === 0) {
        toast.error("No files found to download");
        return;
      }

      const zip = new JSZip();

      const fileMap = new Map<Id<"files">, Doc<"files">>();
      files.forEach((f) => fileMap.set(f._id, f));

      const getFullPath = (file: Doc<"files">): string => {
        if (!file.parentId) return file.name;
        const parent = fileMap.get(file.parentId);
        if (!parent) return file.name;
        return `${getFullPath(parent)}/${file.name}`;
      };

      const fileEntries = files.filter((f) => f.type === "file");
      for (const file of fileEntries) {
        const fullPath = getFullPath(file);
        if (file.content !== undefined) {
          zip.file(fullPath, file.content);
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.name?.replace(/[^a-zA-Z0-9._-]/g, "-") || "project"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Project downloaded as ZIP!");
    } catch (err) {
      console.error("ZIP creation error:", err);
      toast.error("Failed to generate ZIP archive");
    } finally {
      setIsZipping(false);
    }
  };

  const handleCancelExport = async () => {
    await ky.post("/api/github/export/cancel", { json: { projectId } });
  };

  const handleResetExport = async () => {
    await ky.post("/api/github/export/reset", { json: { projectId } });
    setOpen(false);
  };

  // --- GitHub connection panel ---
  const renderGitHubConnectionPanel = () => {
    if (isLoadingStatus) {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
          <Loader2Icon className="size-3 animate-spin" />
          Checking GitHub connection...
        </div>
      );
    }

    if (ghStatus?.connected) {
      return (
        <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 px-3 py-2">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                GitHub connected
                {ghStatus.login ? ` · @${ghStatus.login}` : ""}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500">
                {ghStatus.method === "pat" ? "Personal Access Token" : "OAuth"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDisconnectGitHub}
            disabled={isDisconnecting}
            className="text-muted-foreground hover:text-rose-500 transition-colors disabled:opacity-50"
            title="Disconnect GitHub"
          >
            {isDisconnecting
              ? <Loader2Icon className="size-3.5 animate-spin" />
              : <Trash2Icon className="size-3.5" />
            }
          </button>
        </div>
      );
    }

    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 space-y-2.5">
        <div className="flex items-start gap-2">
          <KeyRoundIcon className="size-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Connect GitHub to export
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
              Paste a{" "}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=Aigorithm+Export"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:text-amber-900"
              >
                GitHub Personal Access Token
              </a>{" "}
              with <code className="bg-amber-100 dark:bg-amber-900 px-0.5 rounded text-[10px]">repo</code> scope.
              Saved securely — enter once, works forever.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            id="github-pat-connect"
            type="password"
            value={patInput}
            onChange={(e) => setPatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleConnectGitHub(); }}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="h-8 text-xs font-mono flex-1"
            autoComplete="off"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            className="h-8 px-3 shrink-0"
            onClick={handleConnectGitHub}
            disabled={isConnecting || !patInput.trim()}
          >
            {isConnecting
              ? <Loader2Icon className="size-3.5 animate-spin" />
              : "Connect"
            }
          </Button>
        </div>
        <button
          type="button"
          className="text-[10px] text-muted-foreground underline hover:text-foreground"
          onClick={() => setShowConnect(false)}
        >
          Cancel
        </button>
      </div>
    );
  };

  // --- Export status screens ---
  const renderContent = () => {
    if (exportStatus === "exporting") {
      return (
        <div className="flex flex-col items-center gap-3 py-4">
          <LoaderIcon className="size-6 animate-spin text-primary" />
          <p className="text-sm font-medium">Exporting to GitHub...</p>
          <p className="text-xs text-muted-foreground text-center">
            Creating repository and pushing project files.
          </p>
          <Button size="sm" variant="outline" className="w-full mt-2" onClick={handleCancelExport}>
            Cancel
          </Button>
        </div>
      );
    }

    if (exportStatus === "completed" && exportRepoUrl) {
      return (
        <div className="flex flex-col items-center gap-3 py-3">
          <CheckCircle2Icon className="size-6 text-emerald-500" />
          <p className="text-sm font-medium">Repository created</p>
          <p className="text-xs text-muted-foreground text-center">
            Your project has been exported to GitHub.
          </p>
          <div className="flex flex-col w-full gap-2 mt-2">
            <Button size="sm" className="w-full" asChild>
              <Link href={exportRepoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="size-4 mr-1" />
                View on GitHub
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={handleResetExport}>
              Export Again
            </Button>
          </div>
        </div>
      );
    }

    if (exportStatus === "failed") {
      return (
        <div className="flex flex-col items-center gap-3 py-3">
          <XCircleIcon className="size-6 text-rose-500" />
          <p className="text-sm font-medium">Unable to export</p>
          <p className="text-xs text-muted-foreground text-center">
            Something went wrong. You can retry or download as a ZIP.
          </p>
          <div className="flex flex-col w-full gap-2 mt-2">
            <Button size="sm" variant="outline" className="w-full" onClick={handleResetExport}>
              Retry
            </Button>
            <Button size="sm" className="w-full" onClick={handleDownloadZip} disabled={isZipping}>
              <DownloadIcon className="size-4 mr-1" />
              Download as ZIP
            </Button>
          </div>
        </div>
      );
    }

    if (exportStatus === "cancelled" || (exportStatus === "completed" && !exportRepoUrl)) {
      return (
        <div className="flex flex-col items-center gap-3 py-3">
          <XCircleIcon className="size-6 text-amber-500" />
          <p className="text-sm font-medium">
            {exportStatus === "cancelled" ? "Export cancelled" : "Export incomplete"}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Click below to reset and start a fresh export.
          </p>
          <Button size="sm" className="w-full mt-2" onClick={handleResetExport}>
            Start New Export
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-muted rounded-lg text-xs font-medium">
          <button
            type="button"
            className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "github"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("github")}
          >
            <FaGithub className="size-3.5" />
            GitHub
          </button>
          <button
            type="button"
            className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "zip"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("zip")}
          >
            <FolderArchiveIcon className="size-3.5" />
            Download ZIP
          </button>
        </div>

        {activeTab === "zip" ? (
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Download Project ZIP</h4>
              <p className="text-xs text-muted-foreground">
                Download all source code files immediately to your computer.
              </p>
            </div>
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between font-mono">
                <span>Files:</span>
                <span>{files ? files.filter((f) => f.type === "file").length : 0}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Archive:</span>
                <span className="truncate max-w-[140px]">{project?.name}.zip</span>
              </div>
            </div>
            <Button
              onClick={handleDownloadZip}
              disabled={isZipping || !files || files.length === 0}
              className="w-full"
              size="sm"
            >
              {isZipping ? (
                <>
                  <Loader2Icon className="size-4 mr-1 animate-spin" />
                  Creating ZIP...
                </>
              ) : (
                <>
                  <DownloadIcon className="size-4 mr-1" />
                  Download ZIP
                </>
              )}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Export to GitHub</h4>
                <p className="text-xs text-muted-foreground">
                  Create a new repository and push all project files.
                </p>
              </div>

              {/* GitHub Connection Panel */}
              {(showConnect || !ghStatus?.connected)
                ? renderGitHubConnectionPanel()
                : renderGitHubConnectionPanel()
              }

              {/* Show form fields only when GitHub is connected */}
              {ghStatus?.connected && (
                <>
                  <form.Field name="repoName">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Repository Name
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="my-project"
                            className="h-8 text-xs"
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field name="visibility">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name} className="text-xs">
                          Visibility
                        </FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value: "public" | "private") =>
                            field.handleChange(value)
                          }
                        >
                          <SelectTrigger id={field.name} className="h-8 text-xs">
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="description">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Description (optional)
                          </FieldLabel>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Project description"
                            rows={2}
                            className="text-xs min-h-[48px]"
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                    {([canSubmit, isSubmitting]) => (
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full mt-2"
                        disabled={!canSubmit || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2Icon className="size-3.5 mr-1 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <FaGithub className="size-3.5 mr-1" />
                            Create Repository
                          </>
                        )}
                      </Button>
                    )}
                  </form.Subscribe>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    );
  };

  const getStatusIcon = () => {
    if (exportStatus === "exporting") {
      return <LoaderIcon className="size-3.5 animate-spin" />;
    }
    if (exportStatus === "completed") {
      return <CheckCheckIcon className="size-3.5 text-emerald-500" />;
    }
    if (exportStatus === "failed") {
      return <XCircleIcon className="size-3.5 text-red-500" />;
    }
    return <FaGithub className="size-3.5" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-1.5 h-full px-3 cursor-pointer text-muted-foreground border-l hover:bg-accent/30 transition-colors">
          {getStatusIcon()}
          <span className="text-sm font-medium">Export</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        {renderContent()}
      </PopoverContent>
    </Popover>
  );
};