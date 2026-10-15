'use client';

import {useTheme} from "next-themes";
import {useEffect, useState} from "react";

const ORDER = ["light", "dark", "system"] as const;
type Mode = (typeof ORDER)[number];

const Icon = ({ mode }: { mode: Mode }) => (
    <svg width="24" height="24" viewBox="o o 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {mode === "light" && (
            <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
        )}
        {mode === "dark" && <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
        {mode === "system" && (
            <>
                <rect x="3" y="4" width="18" height="12" rx="2" />
                <path d="M8 20h8M12 16v4" />
            </>
        )}
    </svg>
);

const ThemeToggle = () => {
    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    //The server doesn't know the theme, so render an empty placeholder until mounted
    if (!mounted) return <span className="icon-btn" aria-hidden="true" />;

    const current: Mode = (ORDER as readonly string[]).includes(theme ?? "") ? (theme as Mode) : "system";
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];

    return (
        <button
            type="button"
            className="icon-btn"
            onClick={() => setTheme(next)}
            aria-label={`Toggle: ${current}. Switch to ${next}`}
            title={`Theme: ${current} (click for ${next})`}>
            <Icon mode={current} />
        </button>
    );
};

export default ThemeToggle;