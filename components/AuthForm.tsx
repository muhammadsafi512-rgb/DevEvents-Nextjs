'use client';

import { useState } from "react";
import { signup, login } from "@/lib/actions/auth.action";

type Props = { mode: "login" | "signup"; onSuccess: () => void };

const AuthForm = ({ mode, onSuccess }: Props) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const result =
                mode === "signup"
                    ? await signup({ name, email, password })
                    : await login({ email, password });

            if (result.success) {
                onSuccess();
                return; // the modal closes and this form unmounts
            }
            setError(result.error);
        } catch {
            setError("Something went wrong. Please try again.");
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {mode === "signup" && (
                <label>
                    Name
                    <input
                        autoComplete="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        minLength={2}
                        maxLength={50}
                        required
                    />
                </label>
            )}

            <label>
                Email
                <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </label>

            <label>
                Password
                <input
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={mode === "signup" ? 8 : undefined}
                    maxLength={72}
                    required
                />
            </label>

            {error && <p role="alert" className="error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
        </form>
    );
};

export default AuthForm;