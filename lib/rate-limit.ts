import { headers } from "next/headers";
import connectDB from "@/lib/mongodb";
import RateLimit from "@/database/rate-limit.model";

export async function getClientIp(): Promise<string> {
    const h = await headers();
    return (
        h.get("x-nf-client-connection-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
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
    const expiresAt = new Date((bucket +1) * windowMs + 60_000);

    const doc = await RateLimit.findOneAndUpdate(
        { key: `${key}:${bucket}`},
        { $inc: { count: 1}, $setOnInsert: { expiresAt } },
        { upsert: true, returnDocument: "after" }
    );
    return { ok: doc.count <= limit };
}

export async function resetRateLimit(key: string){
    await connectDB();
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await RateLimit.deleteMany({ key: { $regex: `^${escaped}:` } });
}