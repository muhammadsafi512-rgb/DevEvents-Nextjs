'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {  useAuthModal } from "@/components/AuthModalProvider";
import { logout } from "@/lib/actions/auth.action";
import { useCreateEventModal} from "@/components/CreateEventModalProvider";
import ThemeToggle from "@/components/ThemeToggle";

export type NavUser = { name: string; role: "user" | "admin" } | null;

const UserIcon =() => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
);

const MenuIcon = ({ open }: { open: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={ open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
    </svg>
);

const NavMenu = ({ user }: { user: NavUser }) => {
    const router = useRouter();
    const { openAuth } = useAuthModal();
    const { openCreateEvent } = useCreateEventModal();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    const gate = (reason: string, target: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (user) return;
        e.preventDefault();
        openAuth({ mode: "login", reason, onSuccess: () => router.push(target) });
    };

    const handleCreate = () => {
        if (user) {
            openCreateEvent();
            return;
        }
        openAuth({mode:"login", reason:"Log in to create an event.", onSuccess: openCreateEvent });
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await logout();
            if (window.location.pathname.startsWith("/my-events")) {
                router.push("/");
            }
            router.refresh();
        } finally {
            setIsLoggingOut(false);
        }
    };

    //The same items are used by the  desktop bar and the mobile panel
    const items = (
        <>
            <li><Link href="/">Home</Link></li>
            <li>
                <Link href="/my-events" onClick={gate("Login to see your events.","/my-events")}>My Events</Link>
            </li>
            <li>
                <button type="button" onClick={handleCreate} className="cursor-pointer">
                    Create Event
                </button>
            </li>
            <li>
                {user ? (
                    <div className="flex items-center gap-3">
                        <span
                            aria-hidden="true"
                            className="flex size-9 items-center justify-center rounded-full bg-primary font-semibold text-black">
                            {user.name.trim().charAt(0).toUpperCase()}
                        </span>
                        <span>{user.name}</span>
                        {user.role === "admin" && <span className="pill">Admin</span>}
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="cursor-pointer text-light-200 hover:text-foreground disabled:opacity-60">
                            Logout
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => openAuth({mode: "login"})}
                        aria-label="Log in or signup"
                        className="flex cursor-pointer items-center gap-2 rounded-full border-dark-200 bg-dark-100 px-4 py-2 hover:border-primary">
                        <UserIcon />
                        <span>Login</span>
                    </button>
                )}
            </li>
        </>
    );


    return (
        <>
            {/*Desktop*/}
        <ul className="max-lg:hidden">
            {items}
            <li><ThemeToggle /></li>
        </ul>

            {/*Mobile: Theme toggle + hamburger */}
            <div className="flex items-center gap-1 lg:hidden">
                <ThemeToggle />
                <button
                    type="button"
                    className="icon-btn"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                    onClick={() => setMenuOpen((o) => !o)}>
                    <MenuIcon open={menuOpen} />
                </button>
            </div>

            {/* Mobile panel: click inside (link, button) closes it*/}
            {menuOpen && (
                <div id="mobile-menu" className="mobile-menu lg:hidden" onClick={() => setMenuOpen(false)}>
                    <ul>{items}</ul>
                </div>
            )}
        </>
    );
};

export default NavMenu;