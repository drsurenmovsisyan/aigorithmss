"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";

import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";

export const ProjectsList = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const projects = useQuery(api.projects.get, isLoaded && isSignedIn ? {} : "skip");

  if (!isLoaded || !isSignedIn || !user) return null;

  return (
    <div className="w-full bg-white dark:bg-sidebar rounded-xl p-8 border border-gray-200 dark:border-border flex flex-col gap-y-6 sm:gap-y-4 shadow-sm text-left">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {user?.firstName ? `${user.firstName}'s Projects` : "Your Projects"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {projects && projects.length === 0 && (
          <div className="col-span-full text-center py-6">
            <p className="text-sm text-muted-foreground">
              No projects found. Create your first project above!
            </p>
          </div>
        )}
        {projects?.map((project) => (
          <Button
            key={project._id}
            variant="outline"
            className="font-normal h-auto justify-start w-full text-start p-4 bg-background hover:bg-gray-50 dark:hover:bg-accent border border-gray-200 dark:border-border transition-colors"
            asChild
          >
            <Link href={`/projects/${project._id}`}>
              <div className="flex items-center gap-x-4">
                <Image
                  src="/logo.svg"
                  alt="Aigorithm"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <div className="flex flex-col min-w-0">
                  <h3 className="truncate font-medium text-gray-900 dark:text-gray-100">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(project.updatedAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};
