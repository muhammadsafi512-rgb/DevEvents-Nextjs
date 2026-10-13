'use client';

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";

type Mode = "login" | "signup";
type OpenOptions = { mode?: Mode; reason?: string; onSuccess?: () => void };

const AuthModalContext = createContext<{ openAuth: (options?: OpenOptions) => void } | null>(null);

export const useAuthModal = () => {
    const ctx = useContext(AuthModalContext);
    if (!ctx) throw new Error("useAuthModal must be used inside <AuthModalProvider>");
    return ctx;
};

const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const onSuccessRef = useRef<(() => void) | undefined>(undefined);
    const titleId = useId();

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("login");
    const [reason, setReason] = useState<string | undefined>();

    const openAuth = useCallback((options: OpenOptions = {}) => {
        setMode(options.mode ?? "login");
        setReason(options.reason);
        onSuccessRef.current = options.onSuccess;
        setOpen(true);
    }, []);

    const close = useCallback(() => setOpen(false), []);

    // Keep the native <dialog> in sync with our state
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    const handleSuccess = () => {
        const after = onSuccessRef.current;
        onSuccessRef.current = undefined;
        setOpen(false);
        router.refresh(); // re-reads the session cookie so the navbar updates
        after?.();        // e.g. continue to the page the user was trying to reach
    };

    const value = useMemo(() => ({ openAuth }), [openAuth]);

    return (
        <AuthModalContext.Provider value={value}>
            {children}

            <dialog
                id="auth-modal"
                ref={dialogRef}
                aria-labelledby={titleId}
                onClose={close} // fires on Escape too
                onClick={(e) => { if (e.target === e.currentTarget) close(); }} // backdrop click
            >
                {open && (
                    <div className="auth-body">
                        <div className="auth-head">
                            <div>
                                <h2 id={titleId} className="auth-title">
                                    {mode === "login" ? "Welcome back" : "Create your account"}
                                </h2>
                                <p className="auth-reason">
                                    {reason ??
                                        (mode === "login"
                                            ? "Log in to book spots and manage your events."
                                            : "Sign up to book spots and host your own events.")}
                                </p>
                            </div>
                            <button type="button" className="auth-close" onClick={close} aria-label="Close">
                                &times;
                            </button>
                        </div>

                        <div className="auth-tabs">
                            {(["login", "signup"] as const).map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    aria-pressed={mode === m}
                                    onClick={() => setMode(m)}
                                >
                                    {m === "login" ? "Log in" : "Sign up"}
                                </button>
                            ))}
                        </div>

                        <AuthForm key={mode} mode={mode} onSuccess={handleSuccess} />

                        <p className="auth-switch">
                            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
                            <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                                {mode === "login" ? "Create an account" : "Log in"}
                            </button>
                        </p>
                    </div>
                )}
            </dialog>
        </AuthModalContext.Provider>
    );
};

export default AuthModalProvider;