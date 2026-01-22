import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(80, "Slug is too long")
  .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only");

export const statusSchema = z.enum(["DRAFT", "PUBLISHED"]);

export type ProposalStatus = z.infer<typeof statusSchema>;
