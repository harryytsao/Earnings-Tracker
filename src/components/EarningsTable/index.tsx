"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Earning } from "@/types/earnings"
import { Sun, Moon, Minus } from "lucide-react"
import ScrollableDateHeader from "./ScrollableDateHeader" // Adjust the import path as needed

export default function EarningsTable({ data }: { data: Earning[] }) {
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return `${tomorrow.getDate()} ${tomorrow.toLocaleString('default', { month: 'short' })}`
    })

    const getTimeIcon = (time: string) => {
        switch (time) {
            case 'time-pre-market':
                return <Sun className="h-4 w-4" />;
            case 'time-after-hours':
                return <Moon className="h-4 w-4" />;
            default:
                return <Minus className="h-4 w-4" />;
        }
    };

    const filteredData = data.filter(earning => {
        const earningDate = new Date(earning.reportDate + 'T00:00:00')
        const formattedEarningDate = `${earningDate.getDate()} ${earningDate.toLocaleString('default', { month: 'short' })}`
        return formattedEarningDate === selectedDate
    })

    return (
        <div className="space-y-4">
            <ScrollableDateHeader
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Last Year EPS</TableHead>
                        <TableHead className="text-right">Forecast EPS</TableHead>
                        <TableHead>Fiscal Quarter Ending</TableHead>
                        <TableHead className="text-right">Market Cap</TableHead>
                        <TableHead className="text-right">Number of Estimates</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((earning) => (
                        <TableRow key={`${earning.symbol}-${earning.reportDate}`}>
                            <TableCell className="flex justify-center">
                                {getTimeIcon(earning.time)}
                            </TableCell>
                            <TableCell>{earning.symbol}</TableCell>
                            <TableCell>{earning.name}</TableCell>
                            <TableCell className="text-right">{earning.lastYearEPS}</TableCell>
                            <TableCell className="text-right">{earning.epsForecast}</TableCell>
                            <TableCell>{earning.fiscalQuarterEnding}</TableCell>
                            <TableCell className="text-right">{earning.marketCap}</TableCell>
                            <TableCell className="text-right">{earning.noOfEsts}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

