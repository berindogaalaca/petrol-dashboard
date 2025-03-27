import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SalesDataModel from "@/models/SalesData";

export async function GET() {
  try {
    await connectToDatabase();

    const salesData = await SalesDataModel.find().sort({ date: -1 }).lean();

    return NextResponse.json(salesData);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
