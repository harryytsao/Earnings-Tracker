import { NextResponse } from "next/server";
import { Earning, EarningTime } from "@/types/earnings";
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";

const prisma = new PrismaClient();
const RATE_LIMIT_SECONDS = 43200; // 12 hours
let lastFetchTime = 0;

async function fetchEarnings() {
  try {
    const today = new Date();
    // Convert to Eastern Time
    const options = { timeZone: "America/New_York" };
    console.log("Today's date (ET):", today.toLocaleString("en-US", options));
    today.setHours(today.getHours() - 9);
    const todayDateString = today.toISOString().split("T")[0];

    // Check if we already have data for today
    const todayData = await prisma.earnings.findFirst({
      where: {
        reportDate: todayDateString,
      },
    });

    if (todayData) {
      console.log("Data already exists for today, skipping fetch");
      const allExistingData = await prisma.earnings.findMany({
        where: {
          reportDate: {
            gte: todayDateString,
          },
        },
        select: {
          symbol: true,
          companyName: true,
          reportDate: true,
          estimatedEps: true,
          lastYearReportDate: true,
          time: true,
          lastYearEps: true,
          fiscalQuarterEnding: true,
          marketCap: true,
          numberOfEstimates: true,
        },
      });
      return allExistingData;
    }

    // Check if we have data starting from today
    const existingData = await prisma.earnings.findFirst({
      where: {
        reportDate: {
          gte: todayDateString,
        },
      },
      orderBy: {
        reportDate: "desc",
      },
    });

    if (existingData) {
      console.log(`Data exists from ${todayDateString}, skipping fetch`);
      const allExistingData = await prisma.earnings.findMany({
        where: {
          reportDate: {
            gte: todayDateString,
          },
        },
        select: {
          symbol: true,
          companyName: true,
          reportDate: true,
          estimatedEps: true,
          lastYearReportDate: true,
          time: true,
          lastYearEps: true,
          fiscalQuarterEnding: true,
          marketCap: true,
          numberOfEstimates: true,
        },
      });
      return allExistingData;
    }

    // Create an array of all dates between today and 2 months ahead
    const dates = [];
    const twoMonthsAhead = new Date(today);
    twoMonthsAhead.setMonth(today.getMonth() + 4);
    let currentDate = new Date(todayDateString);
    while (currentDate <= twoMonthsAhead) {
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
        symbol: String(row.symbol),
        companyName: String(row.name),
        reportDate: row.reportDate,
        estimatedEps: row.epsForecast || null,
        lastYearReportDate: row.lastYearRptDt || null,
        time: (row.time || "time-not-supplied") as EarningTime,
        lastYearEps: row.lastYearEPS || null,
        fiscalQuarterEnding: row.fiscalQuarterEnding || null,
        marketCap: row.marketCap || null,
        numberOfEstimates: row.noOfEsts || null,
      }));

    // Store data in database
    await Promise.all(
      formattedData.map(async (earning) => {
        return prisma.earnings.upsert({
          where: {
            symbol_reportDate: {
              symbol: earning.symbol,
              reportDate: earning.reportDate,
            },
          },
          update: {
            companyName: earning.companyName,
            estimatedEps: earning.estimatedEps,
            time: earning.time,
            lastYearReportDate: earning.lastYearReportDate,
            lastYearEps: earning.lastYearEps,
            fiscalQuarterEnding: earning.fiscalQuarterEnding,
            marketCap: earning.marketCap,
            numberOfEstimates: earning.numberOfEstimates,
          },
          create: {
            symbol: earning.symbol,
            companyName: earning.companyName,
            reportDate: earning.reportDate,
            estimatedEps: earning.estimatedEps,
            time: earning.time,
            lastYearReportDate: earning.lastYearReportDate,
            lastYearEps: earning.lastYearEps,
            fiscalQuarterEnding: earning.fiscalQuarterEnding,
            marketCap: earning.marketCap,
            numberOfEstimates: earning.numberOfEstimates,
          },
        });
      })
    );

    return formattedData;
  } catch (error) {
    console.error("Scraping error:", error);
    throw error;
  }
}

export async function GET() {
  try {
    // Check if enough time has passed since last fetch
    const now = Date.now();
    if (now - lastFetchTime < RATE_LIMIT_SECONDS * 1000) {
      return NextResponse.json(
        { success: false, message: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    lastFetchTime = now;
    const data = await fetchEarnings();

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
