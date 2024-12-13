"use client";

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DateItem {
    dayOfWeek: string
    date: string
    month: string
    isSelected?: boolean
}

interface ScrollableDateHeaderProps {
    selectedDate: string
    onDateSelect: (date: string) => void
}

export default function ScrollableDateHeader({ selectedDate, onDateSelect }: ScrollableDateHeaderProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    // Generate dates excluding weekends
    const dates: DateItem[] = (() => {
        const result: DateItem[] = [];
        let currentDate = new Date();
        const endDate = new Date(2025, 0, 31);

        // Continue until we reach the end date
        while (currentDate <= endDate) {
            // Skip weekends (0 = Sunday, 6 = Saturday)
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                result.push({
                    dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
                    date: currentDate.getDate().toString(),
                    month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
                    isSelected: `${currentDate.getDate()} ${currentDate.toLocaleDateString('en-US', { month: 'short' })}` === selectedDate
                });
            }

            // Move to next day
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }

        return result;
    })();

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 200
            const newScrollLeft = direction === 'left'
                ? scrollRef.current.scrollLeft - scrollAmount
                : scrollRef.current.scrollLeft + scrollAmount

            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            })
        }
    }

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setShowLeftArrow(scrollLeft > 0)
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    useEffect(() => {
        const scrollElement = scrollRef.current
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll)
            handleScroll() // Check initial state
            return () => scrollElement.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <div className="relative flex items-center bg-white border rounded-lg p-2">
            {showLeftArrow && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 z-10 h-full rounded-none border-r bg-white hover:bg-gray-100"
                    onClick={() => scroll('left')}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            )}

            <div
                ref={scrollRef}
                className="flex overflow-x-auto scrollbar-hide gap-4 px-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {dates.map((date, index) => (
                    <button
                        key={index}
                        onClick={() => onDateSelect(`${date.date} ${date.month}`)}
                        className={cn(
                            "flex flex-col items-center min-w-[100px] py-2 px-4 rounded-md transition-colors",
                            date.isSelected
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-gray-100"
                        )}
                    >
                        <span className="text-sm font-medium">{date.dayOfWeek}</span>
                        <span className="text-lg font-bold">{date.date} {date.month}</span>
                    </button>
                ))}
            </div>

            {showRightArrow && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 z-10 h-full rounded-none border-l bg-white hover:bg-gray-100"
                    onClick={() => scroll('right')}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}