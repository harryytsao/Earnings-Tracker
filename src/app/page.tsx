'use client';

import EarningsTable from '@/components/EarningsTable'
import { useEffect, useState } from 'react'
import { Earning } from '@/types/earnings'
import { signIn, signOut, useSession } from 'next-auth/react';
import WatchListSideBar from '@/components/WatchListSideBar';

export default function Home() {
  const { data: session } = useSession();

  const [state, setState] = useState({
    earningsData: [] as Earning[],
    isLoading: true,
    error: null as string | null,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [watchedEarnings, setWatchedEarnings] = useState<Earning[]>([]);

  const fetchEarnings = async () => {
    const maxRetries = 3;
    const backoffDelay = 1000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const res = await fetch("/api/fetch-earnings");

        console.log('API Response Status:', res.status);

        if (res.status === 429) {
          console.log('Rate limited, attempting retry:', attempt + 1);
          await new Promise(resolve => setTimeout(resolve, backoffDelay * (attempt + 1)));
          continue;
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const { success, data, error } = await res.json();

        console.log('Earnings data count:', data?.length);
        console.log('Sample earnings:', data?.slice(0, 2));

        if (!success) {
          throw new Error(error || 'Failed to fetch earnings');
        }

        setState(prev => ({
          ...prev,
          earningsData: data,
          isLoading: false
        }));
        return;
      } catch (error) {
        console.error('Fetch error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to fetch earnings data",
          isLoading: false
        }));
      }
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchWatchedEarnings();
    } else {
      setWatchedEarnings([]);
    }
  }, [session]);

  const fetchWatchedEarnings = async () => {
    try {
      const response = await fetch('/api/watchlist');
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      const { watchedEarnings: dbWatchedEarnings } = await response.json();

      const fullWatchedEarnings = state.earningsData.filter(earning =>
        dbWatchedEarnings.some(
          (watched: any) =>
            watched.symbol === earning.symbol &&
            watched.reportDate === earning.reportDate
        )
      );

      setWatchedEarnings(fullWatchedEarnings);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const handleAuth = () => {
    if (session) {
      signOut();
    } else {
      signIn('github');
    }
  };

  const handleWatchlistUpdate = async (earning: Earning) => {
    if (!session) return;

    const isWatched = watchedEarnings.some(
      e => e.symbol === earning.symbol && e.reportDate === earning.reportDate
    );

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          earning,
          action: isWatched ? 'remove' : 'add',
        }),
      });

      if (!response.ok) throw new Error('Failed to update watchlist');

      setWatchedEarnings(current => {
        if (isWatched) {
          return current.filter(
            e => !(e.symbol === earning.symbol && e.reportDate === earning.reportDate)
          );
        } else {
          return [...current, earning];
        }
      });
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

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
        <EarningsTable
          data={earningsData}
          watchedEarnings={watchedEarnings}
          onWatchlistUpdate={handleWatchlistUpdate}
        />
      </div>
    );
  };

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Upcoming Nasdaq Earnings</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            WatchList ({watchedEarnings.length})
          </button>
          <button
            onClick={handleAuth}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            {session ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>

      <WatchListSideBar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        watchedEarnings={watchedEarnings}
      />

      {renderContent()}
    </main>
  )
}
