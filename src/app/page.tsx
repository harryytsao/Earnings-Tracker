'use client';

import EarningsTable from '@/components/EarningsTable'
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { Earning } from '@/types/earnings'

export default function Home() {
  const [earningsData, setEarningsData] = useState<Earning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScrapeEarnings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scrape-earnings");
      if (!res.ok) throw new Error("Failed to fetch earnings");

      const { data } = await res.json();
      setEarningsData(data);
    } catch (error) {
      console.error("Error in scrapeEarnings:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Nasdaq Earnings</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Button
        onClick={handleScrapeEarnings}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Retrieve Earnings'}
      </Button>
      {earningsData.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">
            Showing {earningsData.length} earnings reports
          </p>
          <EarningsTable data={earningsData} />
        </div>
      )}
    </main>
  )
}
