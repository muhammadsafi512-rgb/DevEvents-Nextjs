'use server';

import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { createSession, deleteSession } from "@/lib/session";
import { rateLimit, getClientIp} from "@/lib/rate-limit";

type AuthResult = { success: true } | { success: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        const [byIp, byAccount] = await Promise.all([
            rateLimit(`login-ip:${ip}`, 20, 15*60),
            rateLimit(`login-acct:${ip}:${email.slice(0, 254)}`, 5, 15*60),
        ]);
        if (!byIp.ok || !byAccount.ok) {
            return { success: false, error: "Too many Login attempts. Please try again later." };
        }
        await connectDB();

        const user = await User.findOne({ email }).select("+passwordHash");
        const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

        if (!user || !valid) {
            return { success: false, error: "Invalid email or password." };  // same message for both cases
        }

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