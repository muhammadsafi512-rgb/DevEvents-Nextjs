import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateState, generateCodeVerifier } from "arctic";
import { getGoogle, safeReturnTo} from "@/lib/google-oauth";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = getGoogle().createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);

    const cookieStore = await cookies();
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 60 * 10,
    };
    cookieStore.set("google_state", state, options);
    cookieStore.set("google_verifier", codeVerifier, options);
    cookieStore.set("google_return_to",safeReturnTo(searchParams.get("returnTo")), options);

    return NextResponse.redirect(url);
}