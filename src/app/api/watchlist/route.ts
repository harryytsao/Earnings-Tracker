import { NextResponse } from "next/server";

// Simple in-memory storage for watchlist (will reset on server restart)
let watchlist: Array<{ symbol: string; reportDate: string }> = [];

// GET endpoint to fetch watched earnings
export async function GET() {
  try {
    return NextResponse.json({ watchedEarnings: watchlist });
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
  try {
    const { earning, action } = await request.json();

    if (action === "add") {
      // Check if the entry already exists
      const existingIndex = watchlist.findIndex(
        (item) =>
          item.symbol === earning.symbol &&
          item.reportDate === earning.reportDate
      );

      // Only add if it doesn't exist
      if (existingIndex === -1) {
        watchlist.push({
          symbol: earning.symbol,
          reportDate: earning.reportDate,
        });
      }
    } else if (action === "remove") {
      // Remove the entry
      watchlist = watchlist.filter(
        (item) =>
          !(
            item.symbol === earning.symbol &&
            item.reportDate === earning.reportDate
          )
      );
    }

    return NextResponse.json({ watchedEarnings: watchlist });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist" },
      { status: 500 }
    );
  }
}
