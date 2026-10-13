import { headers } from "next/headers";
import connectDB from "@/lib/mongodb";
import RateLimit from "@/database/rate-limit.model";

export async function getClientIp(): Promise<string> {
    const host = await headers();
    return (
        host.get("x-nf-client-connection-ip") ?? host.get("x-forwarded-for")?.split(":")[0].trim() ?? "unknown"
    );
}

export async function rateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
) : Promise<{ok : boolean}> {
    await connectDB();

    const windowMs = windowSeconds * 1000;
    const bucket = Math.floor(Date.now() / windowMs);
    const expiresAt = new Date((bucket +1) * windowMs + 60000);

    const doc = await RateLimit.findOneAndUpdate(
        { key: `${key}:${limit}`},
        { $inc: { count: 1}, $setOnInsert: { expiresAt } },
        { upsert: true, returnDocument: "after" }
    );
    return { ok: doc.count <= limit };
}