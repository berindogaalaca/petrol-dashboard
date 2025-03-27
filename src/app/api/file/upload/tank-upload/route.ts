import { NextRequest } from "next/server";
import { parse } from "papaparse";
import { ApiResponse } from "@/lib/api-response";
import { z } from "zod";
import connectToDatabase from "@/lib/mongodb";
import TankDataModel from "@/models/TankData";
import { tankDataSchema } from "./schema";

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

    const { data } = parse(csvData, {
      header: true,
      delimiter: ";",
    });

    if (!Array.isArray(data) || data.length === 0) {
      return ApiResponse.error("CSV format is invalid or empty", {
        status: 400,
      });
    }

    const validData = [];
    const errors = [];

    for (const row of data as Record<string, string>[]) {
      try {
        const dateParts = row["Datum"]?.split(".") || [];
        if (dateParts.length !== 3) {
          throw new Error(`Invalid date format: ${row["Datum"]}`);
        }

        const date = new Date(
          parseInt(dateParts[2]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[0])
        );

        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date: ${row["Datum"]}`);
        }

        const processedRow = {
          tankId: row["TankID"],
          tankName: row["TankName"],
          fuelType: row["KraftstoffTyp"],
          maxCapacity: parseFloat(row["MaxKapazitaet"].replace(",", ".")) || 0,
          currentLevel:
            parseFloat(row["AktuellerBestand"].replace(",", ".")) || 0,
          date,
          time: row["Zeit"],
          salesAmount: parseFloat(row["Verkaufsmenge"].replace(",", ".")) || 0,
          refillAmount: parseFloat(row["Nachfuellung"].replace(",", ".")) || 0,
        };

        const validatedRow = tankDataSchema.parse(processedRow);
        validData.push(validatedRow);
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
      await TankDataModel.insertMany(validData);
    } catch (dbError) {
      console.error("Bulk insert failed, trying individual inserts:", dbError);

      for (const item of validData) {
        try {
          await TankDataModel.create(item);
        } catch (singleError) {
          console.error("Error inserting item:", item.tankId, singleError);
          errors.push(
            `Failed to insert item ${item.tankId}: ${String(singleError)}`
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

    return ApiResponse.success("Tank data uploaded successfully");
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
