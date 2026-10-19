'use client';

import { useMemo, useState } from "react";
import EventCard from "@/components/EventCard";
import type { Document} from "mongoose";
import type { PublicEvent } from "@/database/event.model";

export  type BrowsableEvent = Omit<PublicEvent, keyof Document> & { ended: boolean };

const Section = ({ title, events }: { title: string; events:BrowsableEvent[] }) => {
    if (events.length === 0) return null;

    return (
        <div className="mt-12 space-y-7">
            <h3>{title}</h3>
            <ul className="events">
                {events.map(event => (
                    <li key={event.slug} className="list-none">
                        <EventCard {...event} featured={event.ended ? false : event.featured} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
const PRESET_MODES = ["online", "offline", "hybrid"];
const EventsBrowser = ({ events }: { events: BrowsableEvent[] }) => {
    const [query, setQuery] = useState("");
    const [mode, setMode] = useState("all");

    const modes = useMemo(
        () => Array.from(new Set([...PRESET_MODES, ...events.map((event) => String(event.mode).toLowerCase())])).filter(Boolean),
        [events]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        return events.filter((event) => {
            if (mode !== "all" && String(event.mode).toLowerCase() !== mode) return false;
            if (!q) return true;

            return [event.title, event.location, ...(event.tags ?? [])].some((value) =>
                String(value).toLowerCase().includes(q)
            );
        });
    }, [events, query, mode]);

    const upcoming = filtered
        .filter((event) => !event.ended)
        .sort((a, b) => a.date.localeCompare(b.date));
    const past = filtered
        .filter((event) => event.ended)
        .sort((a, b) => b.date.localeCompare(a.date));

    const featured = upcoming.filter((event) => event.featured);
    const community = upcoming.filter((event) => !event.featured);

    return (
        <>
            <div className="filters">
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, location or tag"
                    aria-label="Search events"
                />
                <div className="filter-modes" role="group" aria-label="Filter by event mode">
                    {["all", ...modes].map((m) => (
                        <button
                            key={m}
                            type="button"
                            aria-pressed={mode === m}
                            onClick={() => setMode(m)}
                        >
                            {m === "all" ? "All" : m}
                        </button>
                    ))}
                </div>
            </div>

            <Section title="Featured Events" events={featured} />
            <Section title="Community Events" events={community} />
            <Section title="Past Events" events={past} />

            {events.length > 0 && filtered.length === 0 && (
                <div className="empty-state mx-auto mt-12 items-center text-center" role="status">
                <p>
                    No events match {query.trim() ? <>"<strong>{query.trim()}</strong>"</> : "this filter"}.
                </p>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                            setQuery("");
                            setMode("all");
                        }}
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </>
    );
};

export default EventsBrowser;