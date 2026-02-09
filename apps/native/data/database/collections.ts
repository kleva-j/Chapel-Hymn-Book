import { z } from "zod";

/**
 * Zod schema for hymn validation
 * Defines the structure for hymns stored in the database
 */
export const HymnZodSchema = z.object({
  id: z.number(),
  title: z.string(),
  number: z.number(),
  content: z.string(),
  verses: z.array(z.string()).readonly(),
  chorus: z.string().optional(),
});
