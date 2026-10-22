import { cookies } from "next/headers";
import { NextResponse} from "next/server";
import { decodeIdToken} from "arctic";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { createSession} from "@/lib/session";
import { getGoogle, safeReturnTo} from "@/lib/google-oauth";
import { baseUrl} from "@/lib/base-url";
import { rateLimit, getClientIp} from "@/lib/rate-limit";


export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const cookieStore = await cookies();
    const savedState = cookieStore.get("google_state")?.value;
    const verifier = cookieStore.get("google_verifier")?.value;
    const returnTo = safeReturnTo(cookieStore.get("google_return_to")?.value);
    ["google_state", "google_verifier", "google_return_to"].forEach((name) => cookieStore.delete(name));

    const fail = () =>
        NextResponse.redirect(
            new URL(`${returnTo}${returnTo.includes("?") ? "&" : "?"}auth_error=1`, baseUrl())
        );

    if (!code || !state || !savedState || !verifier || state !== savedState) return fail();

    try {
        const ip = await getClientIp();
        if (!(await rateLimit(`google-cb:${ip}`, 30, 15 * 60 )).ok) return fail();

        const tokens = await getGoogle().validateAuthorizationCode(code, verifier);
        const claims = decodeIdToken(tokens.idToken()) as {
            sub?: string; email?: string; email_verified?: boolean; name?: string;
        };
        if (!claims.sub || !claims.email || !claims.email_verified) return fail();

        await connectDB();
        const email = claims.email.trim().toLowerCase();

        let user = await User.findOne({ googleId: claims.sub });
        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                //Existing account  with this verified email: link it
                await User.updateOne({ _id: user._id }, { $set: { googleId: claims.sub} });
            } else {
                const rawName = (claims.name ?? "").trim().slice(0, 50);
                const fallback = email.split("@")[0].slice(0, 50);
                const name = rawName.length >= 2 ? rawName: fallback.length >= 2 ? fallback : "User";
                user = await User.create({ name, email, googleId: claims.sub });
            }
        }

        await createSession({ userId: user._id.toString(), name: user.name, role: user.role });
        return NextResponse.redirect(new URL(returnTo, baseUrl()));
    } catch (e) {
        console.error("google callback error:", e);
        return fail();
    }
}