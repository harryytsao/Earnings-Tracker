import EarningsTable from '@/components/EarningsTable'
import { getUpcomingEarnings } from '@/lib/data'

export default async function Home() {
  const earningsData = await getUpcomingEarnings()

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Earnings</h1>
      <EarningsTable data={earningsData} />
    </main>
  )
}

