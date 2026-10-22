'use client';

import { useState } from "react";
import { resetPassword } from "@/lib/actions/auth.action";
import { useAuthModal } from "@/components/AuthModalProvider";

const ResetPasswordForm = ({ token }: { token: string}) => {
    const { openAuth } = useAuthModal();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (pending) return;
        if (password !== confirm) {
            setError("The two passwords don't match");
            return;
        }
        setPending(true);
        setError(null);
        try {
            const result = await resetPassword({ token, password });
            if (result.success) setDone(true);
            else setError(result.error);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setPending(false);
        }
    };

    if (!token) {
        return (
            <div className="reset-card">
                <h2 className="reset-title">Link not valid</h2>
                <p className="reset-sub">This reset link is missing or broken. Request a new one.</p>
                <button type="button" className="btn-primary" onClick={()=> openAuth({ mode: "forgot" })}>
                    Request a new Link
                </button>
            </div>
        );
    }
    if (done) {
        return (
            <div className="reset-card">
                <h2 className="reset-title">Password updated</h2>
                <p className="reset-sub">You can now log in with your new password.</p>
                <button type="button" className="btn-primary" onClick={() => openAuth( {mode: "login"} )}>
                    Log In
                </button>
            </div>
        );
    }

    return (
        <div className="reset-card">
            <div>
                <h2 className="reset-title">Set a new password</h2>
                <p className="reset-sub">Choose a password of 8 to 72 characters.</p>
            </div>
            <form className="reset-form" onSubmit={handleSubmit}>
                <label>
                    New Password
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password" minLength={8} maxLength={72} required />
                </label>
                <label>
                    Confirm Password
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                            autoComplete="new-password" minLength={8} maxLength={72} required />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={pending}>{pending ? "Saving..." : "Update password"}</button>
            </form>
        </div>
    );
};
export default ResetPasswordForm;