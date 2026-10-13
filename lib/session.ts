import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
    userId: string;
    name: string;
    role: "user" | "admin";
};

const getKey = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    return new TextEncoder().encode(secret);
};

export async function createSession(payload: SessionPayload) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getKey());

    (await cookies()).set(COOKIE_NAME, token, {
        httpOnly: true,                                   // JS in the browser can't read it
        secure: process.env.NODE_ENV === "production",    // HTTPS only on the live site
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_SECONDS,
    });
}

export async function getSession(): Promise<SessionPayload | null> {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
        if (typeof payload.userId !== "string" || typeof payload.name !== "string") return null;

        return {
            userId: payload.userId,
            name: payload.name,
            role: payload.role === "admin" ? "admin" : "user",
        };
    } catch {
        return null; // expired, tampered with, or signed with a different secret
    }
}

export async function deleteSession() {
    (await cookies()).delete(COOKIE_NAME);
}