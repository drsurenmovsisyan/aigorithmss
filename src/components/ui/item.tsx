import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const itemVariants = cva(
  "group relative flex items-center justify-between gap-4 rounded-lg p-4 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground hover:bg-accent/50",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemVariants> {}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(itemVariants({ variant }), className)}
      {...props}
    />
  )
);
Item.displayName = "Item";

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center text-muted-foreground",
  {
    variants: {
      variant: {
        default: "",
        icon: "size-10 rounded-full bg-accent text-accent-foreground",
        image: "size-12 overflow-hidden rounded-md object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ItemMediaProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemMediaVariants> {}

const ItemMedia = React.forwardRef<HTMLDivElement, ItemMediaProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(itemMediaVariants({ variant }), className)}
      {...props}
    />
  )
);
ItemMedia.displayName = "ItemMedia";

const ItemContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 flex-col gap-1 min-w-0", className)}
    {...props}
  />
));
ItemContent.displayName = "ItemContent";

const ItemTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn("text-sm font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
ItemTitle.displayName = "ItemTitle";

const ItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground line-clamp-2", className)}
    {...props}
  />
));
ItemDescription.displayName = "ItemDescription";

const ItemActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 shrink-0 ml-auto", className)}
    {...props}
  />
));
ItemActions.displayName = "ItemActions";

export { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions };