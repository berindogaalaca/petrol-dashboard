import { z } from "zod";

export const tankDataSchema = z.object({
  tankId: z.string(),
  tankName: z.string(),
  fuelType: z.string(),
  maxCapacity: z.number(),
  currentLevel: z.number(),
  date: z.date(),
  time: z.string(),
  salesAmount: z.number(),
  refillAmount: z.number(),
});
