import { z } from "zod";

export const csvRowSchema = z.object({
  date: z.string().min(1, "Tarih alanı zorunludur"),
  totalSales: z.string(),
  totalProfit: z.string(),
  malfunctions: z.string(),
  diesel: z.string(),
  adBlue: z.string(),
  superE5: z.string(),
  superE10: z.string(),
  cleaning: z.string(),
});

export const salesDataSchema = z.object({
  date: z.date({
    required_error: "Tarih zorunludur",
    invalid_type_error: "Geçersiz tarih formatı",
  }),
  totalSales: z.number().default(0),
  totalProfit: z.number().default(0),
  malfunctions: z.number().int().default(0),
  diesel: z.number().default(0),
  adBlue: z.number().default(0),
  superE5: z.number().default(0),
  superE10: z.number().default(0),
  cleaning: z.number().default(0),
});

export type CsvRow = z.infer<typeof csvRowSchema>;
export type SalesData = z.infer<typeof salesDataSchema>;
