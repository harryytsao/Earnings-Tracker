import { NextResponse } from "next/server";

interface EarningsRow {
  symbol: string;
  name: string;
  time: string;
  reportDate: string;
  lastYearRptDt: string;
  lastYearEPS: string;
  epsForecast: string;
  fiscalQuarterEnding: string;
  marketCap: string;
  noOfEsts: string;
}

async function scrapeEarnings() {
  try {
    // Get today and end of November
    const today = new Date();
    const endOfNovember = new Date(2024, 10, 30); // Month is 0-based, so 10 = November

    // Format dates as YYYY-MM-DD
    const fromDate = today.toISOString().split("T")[0];
    const toDate = endOfNovember.toISOString().split("T")[0];

    // Create an array of all dates between today and end of November
    const dates = [];
    let currentDate = new Date(fromDate);
    while (currentDate <= endOfNovember) {
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
    const formattedData: EarningsRow[] = allData
      .flat()
      .filter(Boolean)
      .map((row: any) => ({
        symbol: row.symbol || "",
        name: row.name || "",
        time: row.timing || "",
        reportDate: row.reportDate || "", // Include the report date
        lastYearRptDt: row.lastYearRptDt || "",
        lastYearEPS: row.lastYearEPS || "",
        epsForecast: row.epsForecast || "",
        fiscalQuarterEnding: row.fiscalQuarterEnding || "",
        marketCap: row.marketCap || "",
        noOfEsts: row.noOfEsts || "",
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
