'use client';

import { Earning } from '@/types/earnings';

interface WatchListSideBarProps {
    isOpen: boolean;
    onClose: () => void;
    watchedEarnings: Earning[];
}

export default function WatchListSideBar({ isOpen, onClose, watchedEarnings }: WatchListSideBarProps) {
    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Watched Earnings</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        {watchedEarnings.length === 0 ? (
                            <p className="text-gray-500">No watched earnings yet</p>
                        ) : (
                            watchedEarnings.map((earning) => (
                                <div
                                    key={`${earning.symbol}-${earning.reportDate}`}
                                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{earning.symbol}</h3>
                                        <span className="text-sm text-gray-500">
                                            {new Date(earning.reportDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {earning.companyName}
                                    </p>
                                    <div className="mt-2 text-sm">
                                        <p>Est. EPS: {earning.estimatedEps}</p>
                                        <p>Market Cap: {earning.marketCap}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}