import { NextResponse } from "next/server";
import { Earning } from "@/types/earnings";

async function scrapeEarnings() {
  try {
    // Get today till end of december
    const today = new Date();
    const endOfDecember = new Date(2024, 11, 31); // Month is 0-based, so 11 = December

    // Format dates as YYYY-MM-DD
    const fromDate = today.toISOString().split("T")[0];
    const toDate = endOfDecember.toISOString().split("T")[0];

    // Create an array of all dates between today and end of December
    const dates = [];
    let currentDate = new Date(fromDate);
    while (currentDate <= endOfDecember) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Log dates we're fetching
    console.log("Fetching dates:", dates);

    // Fetch data for each date and combine results
    const allData = await Promise.all(
      dates.map(async (date) => {
        const response = await fetch(
          `https://api.nasdaq.com/api/calendar/earnings?date=${date}`,
          {
            headers: {
              Accept: "application/json, text/plain, */*",
              "Accept-Language": "en-US,en;q=0.9",
              "Accept-Encoding": "gzip, deflate, br",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
              Referer: "https://www.nasdaq.com/market-activity/earnings",
              Origin: "https://www.nasdaq.com",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            next: {
              revalidate: 3600,
            },
          }
        );

        if (!response.ok) {
          console.warn(`Failed to fetch data for ${date}: ${response.status}`);
          return [];
        }

        const data = await response.json();

        // Add the date to each row in the response
        const rowsWithDate = (data?.data?.rows || []).map((row: any) => ({
          ...row,
          reportDate: date, // Add the date from the API call
        }));

        return rowsWithDate;
      })
    );

    // Flatten and format all results
    const formattedData: Earning[] = allData
      .flat()
      .filter(Boolean)
      .map((row: any) => ({
        lastYearRptDt: row.lastYearRptDt || "",
        lastYearEPS: row.lastYearEPS || "",
        time: row.time || "time-not-supplied",
        symbol: row.symbol || "",
        name: row.name || "",
        marketCap: row.marketCap || "",
        fiscalQuarterEnding: row.fiscalQuarterEnding || "",
        epsForecast: row.epsForecast || "",
        noOfEsts: row.noOfEsts || "",
        reportDate: row.reportDate || "",
      }));

    return formattedData;
  } catch (error) {
    console.error("Scraping error:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const data = await scrapeEarnings();

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to scrape earnings";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
