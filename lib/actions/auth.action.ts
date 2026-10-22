'use server';

import crypto from "crypto";
import { after } from "next/server";
import PasswordReset from "@/database/password-reset.model";
import { sendPasswordResetEmail} from "@/lib/email";
import { site} from "@/lib/site";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import {createSession, deleteSession, getSession} from "@/lib/session";
import { rateLimit, resetRateLimit,getClientIp} from "@/lib/rate-limit";

type AuthResult = { success: true } | { success: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RESET_TTL_MS = 60 * 60 * 1000; //1 hour
const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
const baseUrl = () => (process.env.NODE_ENV === "production" ? site.url : "http://localhost:3000");

export const signup = async (input: {
    name: string;
    email: string;
    password: string;
}): Promise<AuthResult> => {
    try {
        const ip = await getClientIp();

        if (!(await rateLimit(`signup:${ip}`, 5, 60*60,)).ok) {
            return { success: false, error: "Too many sign-up attempts. Please try again later." };
        }

        const name = String(input?.name ?? "").trim();
        const email = String(input?.email ?? "").trim().toLowerCase();
        const password = String(input?.password ?? "");

        if (name.length < 2 || name.length > 50) {
            return { success: false, error: "Name must be 2 to 50 characters." };
        }
        if (!EMAIL_RE.test(email)) {
            return { success: false, error: "Please enter a valid email address." };
        }
        if (password.length < 8 || password.length > 72) {
            return { success: false, error: "Password must be 8 to 72 characters." };
        }

        await connectDB();

        if (await User.exists({ email })) {
            return { success: false, error: "An account with this email already exists." };
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, passwordHash });

        await createSession({ userId: user._id.toString(), name: user.name, role: user.role });
        return { success: true };
    } catch (e: any) {
        if (e?.code === 11000) {
            return { success: false, error: "An account with this email already exists." };
        }
        console.error("signup error:", e);
        return { success: false, error: "Could not create account. Please try again." };
    }
};

export const login = async (input: { email: string; password: string }): Promise<AuthResult> => {
    try {
        const email = String(input?.email ?? "").trim().toLowerCase();
        const password = String(input?.password ?? "");

        const  ip = await getClientIp();
        const acctKey = `login-acct:${ip}:${email.slice(0, 254)}`;
        const [byIp, byAccount] = await Promise.all([
            rateLimit(`login-ip:${ip}`, 20, 15*60),
            rateLimit(acctKey, 5, 15*60),
        ]);
        if (!byIp.ok || !byAccount.ok) {
            return { success: false, error: "Too many Login attempts. Please try again later." };
        }
        await connectDB();

        const user = await User.findOne({ email }).select("+passwordHash");
        if (user && !user.passwordHash) {
            return { success: false, error: "This account uses Google sign-in. Use the Google button, or reset your password to add one."}
        }
        const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

        if (!user || !valid) {
            return { success: false, error: "Invalid email or password." };  // same message for both cases
        }
        await resetRateLimit(acctKey);
        await createSession({ userId: user._id.toString(), name: user.name, role: user.role });
        return { success: true };
    } catch (e) {
        console.error("login error:", e);
        return { success: false, error: "Could not log in. Please try again." };
    }
};

export const logout = async (): Promise<AuthResult> => {
    await deleteSession();
    return { success: true };
};

export async function isLoggedIn(): Promise<boolean> {
    return !!(await getSession());
}

export const requestPasswordReset = async (input: { email:string}): Promise<AuthResult> => {
    try {
        const email = String(input?.email ?? "").trim().toLowerCase();
        if (!EMAIL_RE.test(email)) {
            return {success: false, error: "Invalid email address. Please enter a valid email address." };
        }

        const ip = await getClientIp();
        const [byIp, byEmail] = await Promise.all([
            rateLimit(`reset-ip:${ip}`, 10, 60 * 60),
            rateLimit(`reset-email:${email.slice(0, 254)}`, 3, 60 * 60),
        ]);
        if (!byIp.ok || !byEmail.ok) {
            return { success: false, error: "Too many requests. Please try again later." };
        }

        await connectDB();
        const user = await User.findOne({ email }).select("name email");

        if (user) {
            await PasswordReset.deleteMany({ userId: user._id });
            const token = crypto.randomBytes(32).toString("hex");
            await PasswordReset.create({
                userId: user._id,
                tokenHash: hashToken(token),
                expiresAt: new Date(Date.now() + RESET_TTL_MS),
            });

            const link = `${baseUrl()}/reset-password?token=${token}`;
            after(async () => {
                try {
                    await sendPasswordResetEmail(user.email, user.name, link);
                } catch (e) {
                    console.error("sendPasswordResetEmail failed:",e);
                }
            });
        }

        //Same answer either way: never reveal which email have accounts
        return { success: true };
    } catch (e) {
        console.error("requestPasswordReset error:", e);
        return { success: false, error: "Could not send the reset link. Please try again later." };
    }
};

export const resetPassword = async (input: {token: string; password: string}): Promise<AuthResult> => {
    const invalid = { success: false, error: "This reset link is invalid or has expired."} as const;
    try {
        const token = String(input?.token ?? "");
        const password = String(input?.password ?? "");

        if (!/^[a-f0-9]{64}$/.test(token)) return invalid;
        if (password.length < 8 || password.length > 72) {
            return { success: false, error: "Password must be 8 to 72 characters." };
        }

        const ip = await getClientIp();
        if (!(await rateLimit(`reset-submit:${ip}`, 10, 60 * 60)).ok) {
            return { success: false, error: "Too many attempts . Please try again later."};
        }

        await connectDB();

        const record = await PasswordReset.findOneAndDelete({
            tokenHash: hashToken(token),
            expiresAt: { $gt: new Date()},
        });
        if (!record) return invalid;

        const passwordHash = await  bcrypt.hash(password, 10);
        const result = await User.updateOne({ _id: record.userId }, { $set: { passwordHash } });

        await PasswordReset.deleteMany({ userId: record.userID });
        return { success: true };
    } catch (e) {
        console.error("resetPassword error:",e);
        return { success: false, error: "Could not reset the password. Please try again later." };
    }
};