'use client';

import EarningsTable from '@/components/EarningsTable'
import { useEffect, useState } from 'react'
import { Earning } from '@/types/earnings'

export default function Home() {
  const [state, setState] = useState({
    earningsData: [] as Earning[],
    isLoading: true,
    error: null as string | null,
  });

  const fetchEarnings = async () => {
    try {
      const res = await fetch("/api/fetch-earnings");
      if (!res.ok) throw new Error("Failed to fetch earnings");

      const { data } = await res.json();
      console.log("Fetched earnings data:", data);
      setState(prev => ({ ...prev, earningsData: data, isLoading: false }));
    } catch (error) {
      console.error("Error fetching earnings:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const renderContent = () => {
    const { error, isLoading, earningsData } = state;

    if (error) return <p className="text-red-500 mb-4">{error}</p>;
    if (isLoading) return <p className="text-gray-500">Loading earnings data...</p>;
    if (earningsData.length === 0) return null;

    return (
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Showing {earningsData.length} earnings reports
        </p>
        <EarningsTable data={earningsData} />
      </div>
    );
  };

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Nasdaq Earnings</h1>
      {renderContent()}
    </main>
  )
}
