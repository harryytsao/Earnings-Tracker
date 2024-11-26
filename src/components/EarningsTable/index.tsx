import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type Earning = {
    symbol: string
    name: string
    time: string
    reportDate: string
    lastYearRptDt: string
    lastYearEPS: string
    epsForecast: string
    fiscalQuarterEnding: string
    marketCap: string
    noOfEsts: string
}

export default function EarningsTable({ data }: { data: Earning[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Report Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Last Year EPS</TableHead>
                    <TableHead className="text-right">Forecast EPS</TableHead>
                    <TableHead className="text-right">Market Cap</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((earning) => (
                    <TableRow key={`${earning.symbol}-${earning.reportDate}`}>
                        <TableCell>{earning.symbol}</TableCell>
                        <TableCell>{earning.name}</TableCell>
                        <TableCell>{earning.reportDate}</TableCell>
                        <TableCell>{earning.time.replace('time-', '')}</TableCell>
                        <TableCell className="text-right">{earning.lastYearEPS}</TableCell>
                        <TableCell className="text-right">{earning.epsForecast}</TableCell>
                        <TableCell className="text-right">{earning.marketCap}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

