import { NextRequest } from "next/server";
import { parse } from "papaparse";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/api-response";
import { z } from "zod";
import { csvRowSchema, SalesData, salesDataSchema } from "./schema";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return ApiResponse.error("No file uploaded", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const csvData = buffer.toString("utf-8");

    const { data } = parse(csvData, { header: true });

    if (!Array.isArray(data) || data.length === 0) {
      return ApiResponse.error("CSV format is invalid or empty", {
        status: 400,
      });
    }

    const validData: SalesData[] = [];
    const errors: string[] = [];

    for (const row of data) {
      try {
        const validRow = csvRowSchema.parse(row);

        const date = new Date(validRow.date);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date: ${validRow.date}`);
        }

        const processedRow = salesDataSchema.parse({
          date,
          totalSales: parseFloat(validRow.totalSales) || 0,
          totalProfit: parseFloat(validRow.totalProfit) || 0,
          malfunctions: parseInt(validRow.malfunctions) || 0,
          diesel: parseFloat(validRow.diesel) || 0,
          adBlue: parseFloat(validRow.adBlue) || 0,
          superE5: parseFloat(validRow.superE5) || 0,
          superE10: parseFloat(validRow.superE10) || 0,
          cleaning: parseFloat(validRow.cleaning) || 0,
        });

        validData.push(processedRow);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(
            `Row validation error: ${error.errors
              .map((e) => e.message)
              .join(", ")}`
          );
        } else if (error instanceof Error) {
          errors.push(error.message);
        } else {
          errors.push("Unknown error");
        }
      }
    }

    if (validData.length === 0) {
      return ApiResponse.error("No valid data found", {
        status: 400,
        details: errors,
      });
    }

    await prisma.salesData.createMany({
      data: validData,
      skipDuplicates: true,
    });

    return ApiResponse.success("CSV uploaded successfully");
  } catch (error) {
    console.error("CSV upload error:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return ApiResponse.error(
      "Failed to upload CSV file",
      error instanceof Error ? error.message : String(error)
    );
  }
}
