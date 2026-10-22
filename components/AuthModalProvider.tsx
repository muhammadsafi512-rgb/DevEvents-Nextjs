'use client';

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

type Mode = "login" | "signup" | "forgot";
type OpenOptions = { mode?: Mode; reason?: string; onSuccess?: () => void };

const AuthModalContext = createContext<{ openAuth: (options?: OpenOptions) => void } | null>(null);

export const useAuthModal = () => {
    const ctx = useContext(AuthModalContext);
    if (!ctx) throw new Error("useAuthModal must be used inside <AuthModalProvider>");
    return ctx;
};

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
        <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/>
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
    </svg>
);

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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("auth_error")) {
            params.delete("auth_error");
            const qs = params.toString();
            window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
            openAuth({ mode: "login", reason: "Google sign-in didn't work. Please try again." });
        }
    }, [openAuth]);

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

    const value = useMemo(() => ({openAuth}), [openAuth]);

    return (
        <AuthModalContext.Provider value={value}>
            {children}

            <dialog
                id="auth-modal"
                ref={dialogRef}
                aria-labelledby={titleId}
                onClose={close} // fires on Escape too
                onClick={(e) => {
                    if (e.target === e.currentTarget) close();
                }} // backdrop click
            >
                {open && (
                    <div className="auth-body">
                        <div className="auth-head">
                            <div>
                                <h2 id={titleId} className="auth-title">
                                    {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
                                </h2>
                                <p className="auth-reason">
                                    {reason ??
                                        (mode === "forgot"
                                            ? "Enter your email and we'll send you a reset link."
                                            : mode === "login"
                                                ? "Log in to book spots and manage your events."
                                                : "Sign up to book spots and host your own events.")
                                    }
                                </p>
                            </div>
                            <button type="button" className="auth-close" onClick={close} aria-label="Close">
                                &times;
                            </button>
                        </div>
                            {mode !== "forgot" && (
                                <div className="auth-tabs">
                                    {(["login", "signup"] as const).map((m) => (
                                        <button key={m} type="button" aria-pressed={mode === m}
                                                onClick={() => setMode(m)}>
                                            {m === "login" ? "Login" : "Signup"}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {mode !== "forgot" && (
                                <>
                                    <a
                                        className="google-btn"
                                        href="/api/auth/google"
                                        onClick={(e) => {
                                            e.currentTarget.href = `/api/auth/google?returnTo=${encodeURIComponent(window.location.pathname)}`;
                                        }}
                                    >
                                        <GoogleIcon /> Continue with Google
                                    </a>
                                    <div className="auth-divider"><span>or</span></div>
                                </>
                            )}
                            {mode === "forgot" ? (
                                <ForgotPasswordForm onBack={() => setMode("login")}/>
                            ) : (
                                <AuthForm key={mode} mode={mode} onSuccess={handleSuccess}/>
                            )}

                            {mode === "login" && (
                                <p className="auth-switch -mt-2">
                                    <button type="button" onClick={() => setMode("forgot")}>Forgot your password?
                                    </button>
                                </p>
                            )}

                            {mode !== "forgot" && (
                                <p className="auth-switch">
                                    {mode === "login" ? "New here?" : "Already have an account?"}{" "}
                                    <button type="button"
                                            onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                                        {mode === "login" ? "Create an account" : "Log in"}
                                    </button>
                                </p>
                            )}
                    </div>
                )}
            </dialog>
        </AuthModalContext.Provider>
    );
};
export default AuthModalProvider;