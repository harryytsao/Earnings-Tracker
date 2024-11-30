import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/options";

// GET endpoint to fetch watched earnings
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const watchedEarnings = await prisma.watchedEarning.findMany({
      where: {
        user: { email: session.user.email },
      },
      select: {
        symbol: true,
        reportDate: true,
      },
    });

    return NextResponse.json({ watchedEarnings });
  } catch (error) {
    if (error instanceof Error && error.message.includes("rate limit")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

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
      // First check if the entry already exists
      const existingWatch = await prisma.watchedEarning.findUnique({
        where: {
          userId_symbol_reportDate: {
            userId: user.id,
            symbol: earning.symbol,
            reportDate: earning.reportDate,
          },
        },
      });

      // Only create if it doesn't exist
      if (!existingWatch) {
        await prisma.watchedEarning.create({
          data: {
            userId: user.id,
            symbol: earning.symbol,
            reportDate: earning.reportDate,
          },
        });
      }
      // If it exists, we can silently succeed since the end state is what the user wanted
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
