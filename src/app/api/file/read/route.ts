import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const salesData = await prisma.salesData.findMany({
      orderBy: { date: "desc" },
    });

    return NextResponse.json(salesData);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
