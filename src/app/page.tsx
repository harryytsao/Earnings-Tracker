"use client";

import { useState, useEffect } from "react";
import { Earning } from "@/types/earnings";
import EarningsTable from "@/components/EarningsTable";
import WatchListSideBar from "@/components/WatchListSideBar";

export default function Home() {
  const [earningsData, setEarningsData] = useState<Earning[]>([]);
  const [watchedEarnings, setWatchedEarnings] = useState<Earning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch earnings data
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/fetch-earnings");

        if (response.status === 429) {
          throw new Error(
            "API rate limit exceeded. Using cached data. Please wait a few minutes before trying again."
          );
        }

        if (!response.ok) {
          throw new Error("Failed to fetch earnings data");
        }

        const result = await response.json();
        if (result.success) {
          setEarningsData(result.data);
          console.log(
            result.cached ? "Using cached data" : "Fetched fresh data"
          );
        } else {
          throw new Error(result.error || "Failed to fetch earnings");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  // Fetch watchlist data
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await fetch("/api/watchlist");
        if (!response.ok) {
          throw new Error("Failed to fetch watchlist");
        }
        const result = await response.json();
        setWatchedEarnings(result.watchedEarnings);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
      }
    };

    fetchWatchlist();
  }, []);

  // Handle watchlist updates
  const handleWatchlistUpdate = async (earning: Earning) => {
    const isWatched = watchedEarnings.some(
      (e) => e.symbol === earning.symbol && e.reportDate === earning.reportDate
    );
    const action = isWatched ? "remove" : "add";

    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ earning, action }),
      });

      if (!response.ok) {
        throw new Error("Failed to update watchlist");
      }

      const result = await response.json();
      setWatchedEarnings(result.watchedEarnings);
    } catch (err) {
      console.error("Error updating watchlist:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nasdaq Earnings Tracker
            </h1>
            <button
              onClick={() => setIsWatchlistOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Watchlist ({watchedEarnings.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EarningsTable
          data={earningsData}
          watchedEarnings={watchedEarnings}
          onWatchlistUpdate={handleWatchlistUpdate}
        />
      </main>

      <WatchListSideBar
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchedEarnings={watchedEarnings}
      />
    </div>
  );
}
