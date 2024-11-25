// pages/api/scrape-earnings.js
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

interface EarningsRow {
  symbol: string;
  company: string;
  date: string;
  estimate: string;
  actual: string;
}

export default async function handler(req: Request, res: Response) {
  let driver;
  try {
    const options = new chrome.Options();
    options.addArguments("--headless");
    options.addArguments("--disable-gpu");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    // Add timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), 15000)
    );

    const scrapePromise = (async () => {
      await driver.get("https://www.nasdaq.com/market-activity/earnings");
      await driver.wait(until.elementLocated(By.css(".earnings-table")), 10000);

      const earnings = await driver.findElements(By.css(".earnings-table tr"));
      const rows = await Promise.all(
        earnings.slice(1).map(async (row: any) => {
          const cells = await row.findElements(By.css("td"));
          const [symbol, company, date, estimate, actual] = await Promise.all(
            cells.map((cell: any) => cell.getText())
          );

          return { symbol, company, date, estimate, actual };
        })
      );

      return rows;
    })();

    const data = (await Promise.race([
      timeoutPromise,
      scrapePromise,
    ])) as EarningsRow[];
    res.status(200).json({ data });
  } catch (error: any) {
    console.error("Scraping error:", error);
    res.status(500).json({
      error: "Failed to fetch earnings data",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    if (driver) {
      try {
        await driver.quit();
      } catch (error: any) {
        console.error("Error closing browser:", error);
      }
    }
  }
}
