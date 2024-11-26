import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

// GET endpoint to fetch watched earnings
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        watchedEarnings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ watchedEarnings: user.watchedEarnings });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

// POST endpoint to update watched earnings
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { earning, action } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "add") {
      await prisma.watchedEarning.create({
        data: {
          userId: user.id,
          symbol: earning.symbol,
          reportDate: earning.reportDate,
        },
      });
    } else if (action === "remove") {
      await prisma.watchedEarning.deleteMany({
        where: {
          userId: user.id,
          symbol: earning.symbol,
          reportDate: earning.reportDate,
        },
      });
    }

    const updatedWatchlist = await prisma.watchedEarning.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ watchedEarnings: updatedWatchlist });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist" },
      { status: 500 }
    );
  }
}
