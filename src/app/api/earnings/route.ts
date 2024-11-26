import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const earnings = await prisma.earnings.findMany({
      where: {
        reportDate: {
          gte: new Date().toISOString(), // Only future earnings
        },
      },
      orderBy: {
        reportDate: "asc",
      },
    });

    return NextResponse.json({ data: earnings });
  } catch (error) {
    console.error("Error fetching earnings:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
