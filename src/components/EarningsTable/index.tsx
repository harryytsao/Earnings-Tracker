"use client";

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
import { useSession } from "next-auth/react"
import { Sparklines, SparklinesLine } from "react-sparklines"
import { Badge } from "@/components/ui/badge"

const SORT_DIRECTIONS = {
    ASC: 'asc',
    DESC: 'desc',
} as const;

type SortDirection = typeof SORT_DIRECTIONS[keyof typeof SORT_DIRECTIONS];
type SortConfig = {
    key: keyof Earning;
    direction: SortDirection;
} | null;

const TIME_ICONS = {
    'time-pre-market': <Sun className="h-4 w-3" />,
    'time-after-hours': <Moon className="h-4 w-3" />,
    default: <Minus className="h-4 w-3" />,
} as const;

const getTimeIcon = (time: string | null) => {
    return TIME_ICONS[time as keyof typeof TIME_ICONS] || TIME_ICONS.default;
};

function TableHeaderCell({ label, sortKey, onSort }: {
    label: string;
    sortKey: keyof Earning;
    onSort: (key: keyof Earning) => void;
}) {
    return (
        <TableHead className={sortKey.includes('Eps') || sortKey === 'marketCap' || sortKey === 'numberOfEstimates' ? 'text-right' : ''}>
            <Button variant="ghost" onClick={() => onSort(sortKey)}>
                {label} <ChevronsUpDown className="ml-1 h-4 w-3" />
            </Button>
        </TableHead>
    );
}

const getSortedData = (data: Earning[], sortConfig: SortConfig): Earning[] => {
    if (!sortConfig) {
        return sortByMarketCap(data);
    }

    const { key, direction } = sortConfig;
    return [...data].sort((a, b) => {
        if (key === 'marketCap') {
            return sortByMarketCap([a, b], direction)[0] === a ? -1 : 1;
        }

        const aValue = String(a[key] ?? '');
        const bValue = String(b[key] ?? '');
        return direction === SORT_DIRECTIONS.ASC
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
    });
};

const sortByMarketCap = (data: Earning[], direction: SortDirection = SORT_DIRECTIONS.DESC) => {
    return [...data].sort((a, b) => {
        const marketCapA = parseFloat((a.marketCap ?? '0').replace(/[^0-9.-]+/g, ''));
        const marketCapB = parseFloat((b.marketCap ?? '0').replace(/[^0-9.-]+/g, ''));
        return direction === SORT_DIRECTIONS.ASC
            ? marketCapA - marketCapB
            : marketCapB - marketCapA;
    });
};

interface EarningsTableProps {
    data: Earning[];
    watchedEarnings: Earning[];
    onWatchlistUpdate: (earning: Earning) => void;
}

export default function EarningsTable({
    data,
    watchedEarnings,
    onWatchlistUpdate
}: EarningsTableProps) {
    const { data: session } = useSession();

    const formatDate = (date: Date) => {
        const localDate = new Date(date.toLocaleDateString('en-US'));
        return `${localDate.getDate()} ${localDate.toLocaleString('default', { month: 'short' })}`
    };

    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date();
        return formatDate(today);
    })

    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const handleSort = (key: keyof Earning) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === SORT_DIRECTIONS.ASC
                    ? { key, direction: SORT_DIRECTIONS.DESC }
                    : null;
            }
            return { key, direction: SORT_DIRECTIONS.ASC };
        });
    };

    const handleWatchlistToggle = (earning: Earning) => {
        onWatchlistUpdate(earning);
    };

    const filteredAndSortedData = getSortedData(
        data.filter(earning => {
            const earningDate = new Date(earning.reportDate + 'T00:00:00');
            return formatDate(earningDate) === selectedDate;
        }),
        sortConfig
    );

    return (
        <div className="space-y-4">
            {session && (
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Welcome, {session.user?.name}</h2>
                    <Badge variant="outline">{watchedEarnings.length} Watched</Badge>
                </div>
            )}
            <ScrollableDateHeader
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />
            {filteredAndSortedData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No earnings reports scheduled for {selectedDate}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell label="Time" sortKey="time" onSort={handleSort} />
                            <TableHeaderCell label="Symbol" sortKey="symbol" onSort={handleSort} />
                            <TableHeaderCell label="Company" sortKey="companyName" onSort={handleSort} />
                            <TableHeaderCell label="Last Year EPS" sortKey="lastYearEps" onSort={handleSort} />
                            <TableHeaderCell label="Estimated EPS" sortKey="estimatedEps" onSort={handleSort} />
                            <TableHeaderCell label="Fiscal Quarter Ending" sortKey="fiscalQuarterEnding" onSort={handleSort} />
                            <TableHeaderCell label="Market Cap" sortKey="marketCap" onSort={handleSort} />
                            <TableHeaderCell label="No. of Estimates" sortKey="numberOfEstimates" onSort={handleSort} />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedData.map((earning) => (
                            <TableRow
                                key={`${earning.symbol}-${earning.reportDate}`}
                                className={watchedEarnings.some(e => e.symbol === earning.symbol) ? 'bg-muted/50' : ''}
                            >
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
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleWatchlistToggle(earning)}
                                    >
                                        {watchedEarnings.some(e => e.symbol === earning.symbol) ? '★' : '☆'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

