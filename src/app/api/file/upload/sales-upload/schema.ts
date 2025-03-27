import { z } from "zod";

export const csvRowSchema = z.object({
  transactionNumber: z.string(),
  date: z.string().min(1, "Tarih alanı zorunludur"),
  time: z.string(),
  articleNumber: z.string(),
  productDescription: z.string(),
  quantity: z.string(),
  unitPrice: z.string(),
  grossAmount: z.string(),
  unit: z.string(),
  vatPercent: z.string(),
  vatIdentifier: z.string(),
  currencyCode: z.string(),
  vatAmount: z.string(),
  paymentMethodId: z.string(),
  paymentLocation: z.string(),
  cardNumber: z.string().optional(),
  customerNumber: z.string().optional(),
  personCard: z.string().optional(),
  driverNumber: z.string().optional(),
  fuelPumpNumber: z.string().optional(),
  stationNumber: z.string().optional(),
  costCenter: z.string().optional(),
  cashRegisterNumber: z.string().optional(),
  extraField: z.string().optional(),
  terminalID: z.string().optional(),
  couponNumber: z.string().optional(),
});

export const salesDataSchema = z.object({
  transactionNumber: z.string(),
  date: z.date({
    required_error: "Tarih zorunludur",
    invalid_type_error: "Geçersiz tarih formatı",
  }),
  time: z.string(),
  articleNumber: z.string(),
  productDescription: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  grossAmount: z.number(),
  unit: z.string(),
  vatPercent: z.number(),
  vatIdentifier: z.string(),
  currencyCode: z.string(),
  vatAmount: z.number(),
  paymentMethodId: z.string(),
  paymentLocation: z.string(),
  cardNumber: z.string().optional().nullable(),
  customerNumber: z.string().optional().nullable(),
  personCard: z.string().optional().nullable(),
  driverNumber: z.string().optional().nullable(),
  fuelPumpNumber: z.string().optional().nullable(),
  stationNumber: z.string().optional().nullable(),
  costCenter: z.string().optional().nullable(),
  cashRegisterNumber: z.string().optional().nullable(),
  extraField: z.string().optional().nullable(),
  terminalID: z.string().optional().nullable(),
  couponNumber: z.string().optional().nullable(),
});

export type CsvRow = z.infer<typeof csvRowSchema>;
export type SalesData = z.infer<typeof salesDataSchema>;

export type SalesDataInput = Omit<SalesData, "_id" | "createdAt" | "updatedAt">;
