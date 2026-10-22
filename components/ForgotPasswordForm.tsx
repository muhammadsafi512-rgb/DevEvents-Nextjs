'use client';

import { useState } from "react";
import { requestPasswordReset} from "@/lib/actions/auth.action";


const ForgotPasswordForm = ({ onBack}: { onBack: () => void }) => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (pending) return;
        setPending(true);
        setError(null);
        try {
            const result = await requestPasswordReset({ email });
            if (result.success) setSent(true);
            else setSent(false);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setPending(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-form">
                <p className="text-sm">
                    If an account exists for <strong>{email.trim()}</strong>, we&apos;ve sent a link to reset
                    the password. It expires in 1 hour. Check your spam folder if you don&apos;t see it.
                </p>
                <p className="auth-switch">
                    <button type="button" onClick={onBack}>Back to log in</button>
                </p>
            </div>
        );
    }
    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email" required />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={pending}>{pending ? "Sending..." : "Sent reset link"}</button>
        </form>
    );
};

export default ForgotPasswordForm;