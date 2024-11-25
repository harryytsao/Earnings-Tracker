import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type Earning = {
    date: string
    time: string
    company: string
    symbol: string
    estimatedEPS: number
}

export default function EarningsTable({ data }: { data: Earning[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Estimated EPS</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((earning) => (
                    <TableRow key={`${earning.symbol}-${earning.date}-${earning.time}`}>
                        <TableCell>{earning.symbol}</TableCell>
                        <TableCell>{earning.date}</TableCell>
                        <TableCell>{earning.time}</TableCell>
                        <TableCell>{earning.company}</TableCell>
                        <TableCell className="text-right">{earning.estimatedEPS.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

