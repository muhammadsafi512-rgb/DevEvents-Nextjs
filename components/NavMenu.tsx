'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {  useAuthModal } from "@/components/AuthModalProvider";
import { logout } from "@/lib/actions/auth.action";
import { useCreateEventModal} from "@/components/CreateEventModalProvider";

export type NavUser = { name: string; role: "user" | "admin" } | null;

const UserIcon =() => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
);
const NavMenu = ({ user }: { user: NavUser }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { openAuth } = useAuthModal();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const gate = (reason: string, target: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (user) return;
        e.preventDefault();
        openAuth({ mode: "login", reason, onSuccess: () => router.push(target) });
    };
    const { openCreateEvent } = useCreateEventModal();

    const handleCreate = () => {
        if (user) {
            openCreateEvent();
            return;
        }
        openAuth({mode:"login", reason:"Log in to create an event.", onSuccess: openCreateEvent});
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await logout();
            if (pathname.startsWith("/my-events")) {
                router.push("/");
            }
            router.refresh();
        } finally {
            setIsLoggingOut(false);
        }
    };
    return (
        <ul>
            <li><Link href="/">Home</Link></li>
            <li>
                <Link href="/my-events" onClick={gate("Log in to see your events.", "/my-events")}>My Events</Link>
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
                        <span className="max-sm:hidden">{user.name}</span>
                        {user.role === "admin" && <span className="pill max-sm:hidden">Admin</span>}
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="cursor-pointer text-light-200 hover:text-white disabled:opacity-60">
                            Logout
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={()=> openAuth({mode:"login"})}
                        aria-label="Login or signup"
                        className="flex cursor-pointer items-center gap-2 rounded-full border border-dark-200 bg-dark-100 px-4 py-2 hover:border-primary">
                        <UserIcon/>
                        <span className="max-sm:hidden">Login</span>
                    </button>
                )}
            </li>
        </ul>
    );
};

export default NavMenu;