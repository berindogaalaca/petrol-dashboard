import { NextRequest } from "next/server";
import { parse } from "papaparse";
import { ApiResponse } from "@/lib/api-response";
import { z } from "zod";
import { csvRowSchema, SalesData, salesDataSchema } from "./schema";
import connectToDatabase from "@/lib/mongodb";
import SalesDataModel from "@/models/SalesData";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

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

        const dateParts = validRow.date.split(".");
        const date = new Date(
          parseInt(dateParts[2]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[0])
        );
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date: ${validRow.date}`);
        }

        const processedRow = salesDataSchema.parse({
          transactionNumber: validRow.transactionNumber,
          date,
          time: validRow.time,
          articleNumber: validRow.articleNumber,
          productDescription: validRow.productDescription,
          quantity: parseFloat(validRow.quantity.replace(",", ".")) || 0,
          unitPrice: parseFloat(validRow.unitPrice.replace(",", ".")) || 0,
          grossAmount: parseFloat(validRow.grossAmount.replace(",", ".")) || 0,
          unit: validRow.unit,
          vatPercent: parseFloat(validRow.vatPercent.replace(",", ".")) || 0,
          vatIdentifier: validRow.vatIdentifier,
          currencyCode: validRow.currencyCode,
          vatAmount: parseFloat(validRow.vatAmount.replace(",", ".")) || 0,
          paymentMethodId: validRow.paymentMethodId,
          paymentLocation: validRow.paymentLocation,
          cardNumber: validRow.cardNumber,
          customerNumber: validRow.customerNumber,
          personCard: validRow.personCard,
          driverNumber: validRow.driverNumber,
          fuelPumpNumber: validRow.fuelPumpNumber,
          stationNumber: validRow.stationNumber,
          costCenter: validRow.costCenter,
          cashRegisterNumber: validRow.cashRegisterNumber,
          extraField: validRow.extraField,
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

    try {
      await SalesDataModel.insertMany(validData);
    } catch (dbError) {
      console.error("Bulk insert failed, trying individual inserts:", dbError);

      for (const item of validData) {
        try {
          await SalesDataModel.create(item);
        } catch (singleError) {
          console.error(
            "Error inserting item:",
            item.transactionNumber,
            singleError
          );
          errors.push(
            `Failed to insert item ${item.transactionNumber}: ${String(
              singleError
            )}`
          );
        }
      }

      if (errors.length > 0) {
        return ApiResponse.error("Some records failed to insert", {
          status: 207,
          details: errors,
        });
      }
    }

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
