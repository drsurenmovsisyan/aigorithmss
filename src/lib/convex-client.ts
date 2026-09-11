import { ConvexHttpClient } from "convex/browser";

export const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export const getInternalKey = () =>
  process.env.AIGORITHM_CONVEX_INTERNAL_KEY ||
  process.env.CONVEX_INTERNAL_KEY ||
  process.env.POLARIS_CONVEX_INTERNAL_KEY ||
  "aushahs7171621171gashahjg";