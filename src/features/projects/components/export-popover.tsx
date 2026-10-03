import React, { useState } from "react";
import ky, { HTTPError } from "ky";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { useClerk } from "@clerk/nextjs";
import { FaGithub } from "react-icons/fa";
import {
  CheckCheckIcon,
  CheckCircle2Icon,
  DownloadIcon,
  ExternalLinkIcon,
  FolderArchiveIcon,
  Loader2Icon,
  LoaderIcon,
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

interface ExportPopoverProps {
  projectId: Id<"projects">;
}

export const ExportPopover = ({ projectId }: ExportPopoverProps) => {
  const project = useProject(projectId);
  const files = useFiles(projectId);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"github" | "zip">("github");
  const [isZipping, setIsZipping] = useState(false);
  const { openUserProfile } = useClerk();

  const exportStatus = project?.exportStatus;
  const exportRepoUrl = project?.exportRepoUrl;

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
      try {
        await ky.post("/api/github/export", {
          json: {
            projectId,
            repoName: value.repoName,
            visibility: value.visibility,
            description: value.description || undefined,
          },
        });

        toast.success("Export started...");
      } catch (error) {
        if (error instanceof HTTPError) {
          try {
            const body = await error.response.json<{ error: string }>();
            if (body.error?.includes("GitHub not connected")) {
              toast.error("GitHub account not connected", {
                description: "Connect GitHub in your profile or download as ZIP.",
                action: {
                  label: "Connect",
                  onClick: () => openUserProfile(),
                },
              });
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

      // Build path hierarchy
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
    await ky.post("/api/github/export/cancel", {
      json: { projectId },
    });
  };

  const handleResetExport = async () => {
    await ky.post("/api/github/export/reset", {
      json: { projectId },
    });
    setOpen(false);
  };

  const renderContent = () => {
    if (exportStatus === "exporting") {
      return (
        <div className="flex flex-col items-center gap-3 py-4">
          <LoaderIcon className="size-6 animate-spin text-primary" />
          <p className="text-sm font-medium">Exporting to GitHub...</p>
          <p className="text-xs text-muted-foreground text-center">
            Creating repository and pushing project files.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-2"
            onClick={handleCancelExport}
          >
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
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleResetExport}
            >
              Close
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
            Something went wrong. You can retry or download directly as a ZIP.
          </p>
          <div className="flex flex-col w-full gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleResetExport}
            >
              Retry
            </Button>
            <Button
              size="sm"
              className="w-full"
              onClick={handleDownloadZip}
              disabled={isZipping}
            >
              <DownloadIcon className="size-4 mr-1" />
              Download as ZIP
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Tab switch between GitHub and ZIP */}
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
              <form.Field name="repoName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

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
                {(field) => {
                  return (
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
                  );
                }}
              </form.Field>

              <form.Field name="description">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

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

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
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