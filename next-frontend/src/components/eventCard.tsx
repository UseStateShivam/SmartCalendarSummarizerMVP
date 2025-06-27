import { EventType } from '@/lib/types/event'
import React from 'react'

type EventCardProps = {
    event: EventType
    index: number
    loadingIndex?: number | null
    generateSummary?: (event: EventType, index: number) => void | Promise<void>
}

function EventCard({ event, index, loadingIndex, generateSummary }: EventCardProps) {
    return (
        <div
            key={event.id}
            className="bg-white text-black rounded-2xl shadow-lg p-6 hover:scale-[1.01] transition-transform"
        >
            <h2 className="text-xl font-semibold text-blue-800">{event.summary}</h2>
            <p className="text-sm text-gray-600 mt-1">{new Date(event.start).toLocaleString()}</p>
            <p className="mt-3 text-gray-800 text-sm min-h-[80px]">
                {event.aiSummary || 'No summary yet.'}
            </p>
            {generateSummary && (
                <button
                    onClick={() => generateSummary(event, index)}
                    disabled={loadingIndex === index}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
                >
                    {loadingIndex === index
                        ? 'Generating...'
                        : event.aiSummary
                            ? 'Regenerate Summary'
                            : 'Generate Summary'}
                </button>
            )}
        </div>
    )
}

export default EventCard
