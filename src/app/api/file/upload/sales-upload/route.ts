import { NextRequest } from "next/server";
import { parse } from "papaparse";
import { ApiResponse } from "@/lib/api-response";
import { z } from "zod";
import connectToDatabase from "@/lib/mongodb";
import { SalesData, salesDataSchema } from "./schema";
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

        const processedData = {
          transactionNumber: row["LaufNr"],
          date,
          time: row["Zeit"],
          articleNumber: row["ArtikelNr"],
          productDescription: row["WarenBezeichnung"],
          quantity: parseFloat((row["Menge"] || "0").replace(",", ".")) || 0,
          unitPrice:
            parseFloat((row["Einzelpreis"] || "0").replace(",", ".")) || 0,
          grossAmount:
            parseFloat((row["BetragBrutto"] || "0").replace(",", ".")) || 0,
          unit: row["MengenEinheit"],
          vatPercent:
            parseFloat((row["MwstProzent"] || "0").replace(",", ".")) || 0,
          vatIdentifier: row["MwstKennzeichen"],
          currencyCode: row["WaehrungsKennzeichen"],
          vatAmount:
            parseFloat((row["BetragMwst"] || "0").replace(",", ".")) || 0,
          paymentMethodId: row["ZahlungsmittelID"],
          paymentLocation: row["OrtZahlungsvorgang"],
          cardNumber: row["KartenNr"],
          customerNumber: row["KundenNr"],
          personCard: row["PersonenKarte"],
          driverNumber: row["FahrerNr"],
          fuelPumpNumber: row["TankplatzNr"],
          stationNumber: row["StationsNr"],
          costCenter: row["KostenStelle"],
          cashRegisterNumber: row["KassenNr"],
          extraField: row["BedienerNr"],
        };


        const processedRow = salesDataSchema.parse(processedData);
        validData.push(processedRow);
      } catch (error) {
        console.error("Satır işleme hatası:", error);
        if (error instanceof z.ZodError) {
          console.error("Zod doğrulama hatası:", error.errors);
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
      console.error("Bulk insert failed:", dbError);

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
