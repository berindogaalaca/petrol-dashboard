import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import TankDataModel from "@/models/TankData";

export async function GET() {
  try {
    await connectToDatabase();

    const tankData = await TankDataModel.find().sort({ date: -1 }).lean();

    return NextResponse.json(tankData);
  } catch (error) {
    console.error("Error fetching tank data:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
