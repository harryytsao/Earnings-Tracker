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
import { Sun, Moon, Minus, ChevronsUpDown } from "lucide-react"
import ScrollableDateHeader from "./ScrollableDateHeader"
import { Button } from "@/components/ui/button"

const getTimeIcon = (time: string | null) => {
    switch (time) {
        case 'time-pre-market':
            return <Sun className="h-4 w-3" />;
        case 'time-after-hours':
            return <Moon className="h-4 w-3" />;
        default:
            return <Minus className="h-4 w-3" />;
    }
};

export default function EarningsTable({ data }: { data: Earning[] }) {
    const formatDate = (date: Date) => {
        const localDate = new Date(date.toLocaleDateString('en-US'));
        return `${localDate.getDate()} ${localDate.toLocaleString('default', { month: 'short' })}`
    };

    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date();
        return formatDate(today);
    })

    const [sortConfig, setSortConfig] = useState<{
        key: keyof Earning;
        direction: 'asc' | 'desc';
    } | null>(null);

    const sortData = (data: Earning[]) => {
        if (!sortConfig) {
            // Default sort by market cap
            return data.sort((a, b) => {
                const marketCapA = parseFloat((a.marketCap ?? '0').replace(/[^0-9.-]+/g, ''));
                const marketCapB = parseFloat((b.marketCap ?? '0').replace(/[^0-9.-]+/g, ''));
                return marketCapB - marketCapA;
            });
        }

        return [...data].sort((a, b) => {
            if (sortConfig.key === 'marketCap') {
                const marketCapA = parseFloat((a.marketCap ?? '0').replace(/[^0-9.-]+/g, ''));
                const marketCapB = parseFloat((b.marketCap ?? '0').replace(/[^0-9.-]+/g, ''));
                return sortConfig.direction === 'asc' ? marketCapA - marketCapB : marketCapB - marketCapA;
            }

            const aValue = a[sortConfig.key] ?? '';
            const bValue = b[sortConfig.key] ?? '';

            if (sortConfig.direction === 'asc') {
                return String(aValue).localeCompare(String(bValue));
            }
            return String(bValue).localeCompare(String(aValue));
        });
    };

    const handleSort = (key: keyof Earning) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === 'asc'
                    ? { key, direction: 'desc' }
                    : null;
            }
            return { key, direction: 'asc' };
        });
    };

    const filteredAndSortedData = sortData(
        data.filter(earning => {
            const earningDate = new Date(earning.reportDate + 'T00:00:00');
            return formatDate(earningDate) === selectedDate;
        })
    );

    return (
        <div className="space-y-4">
            <ScrollableDateHeader
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />
            {filteredAndSortedData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No earnings reports scheduled for this date
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Button variant="ghost" onClick={() => handleSort('time')}>
                                    Time <ChevronsUpDown className="ml-1 h-4 w-3" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => handleSort('symbol')}>
                                    Symbol <ChevronsUpDown className="ml-1 h-4 w-3" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => handleSort('companyName')}>
                                    Company <ChevronsUpDown className="ml-1 h-4 w-3" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">
                                <Button variant="ghost" onClick={() => handleSort('lastYearEps')}>
                                    Last Year EPS <ChevronsUpDown className="ml-1 h-4 w-3" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">
                                <Button variant="ghost" onClick={() => handleSort('estimatedEps')}>
                                    Estimated EPS <ChevronsUpDown className="ml-1 h-4 w-3" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => handleSort('fiscalQuarterEnding')}>
                                    Fiscal Quarter Ending <ChevronsUpDown className="ml-1 h-4 w-3" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">
                                <Button variant="ghost" onClick={() => handleSort('marketCap')}>
                                    Market Cap <ChevronsUpDown className="ml-1 h-4 w-3" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">
                                <Button variant="ghost" onClick={() => handleSort('numberOfEstimates')}>
                                    No. of Estimates <ChevronsUpDown className="ml-1 h-4 w-3" />
                                </Button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedData.map((earning) => (
                            <TableRow key={`${earning.symbol}-${earning.reportDate}`}>
                                <TableCell className="flex justify-center">
                                    {getTimeIcon(earning.time)}
                                </TableCell>
                                <TableCell>{earning.symbol}</TableCell>
                                <TableCell>{earning.companyName}</TableCell>
                                <TableCell className="text-center">{earning.lastYearEps}</TableCell>
                                <TableCell className="text-center">{earning.estimatedEps}</TableCell>
                                <TableCell className="text-center">{earning.fiscalQuarterEnding}</TableCell>
                                <TableCell className="text-center">{earning.marketCap}</TableCell>
                                <TableCell className="text-center">{earning.numberOfEstimates}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

