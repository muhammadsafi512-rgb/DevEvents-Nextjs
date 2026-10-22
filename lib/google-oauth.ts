import { Google } from "arctic";
import { baseUrl} from "@/lib/base-url";
import {base} from "next/dist/build/webpack/config/blocks/base";
import {projectNew} from "next/dist/build/swc/generated-native";

export const getGoogle = () => new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${baseUrl()}/api/auth/google/callback`
);

//Only allow returning to a page on our own site
export const safeReturnTo = (value: string | null | undefined) => {
    try {
        const base = baseUrl();
        const target = new URL(value ?? "/", base);
        return target.origin === new URL(base).origin ? target.pathname + target.search : "/";
    } catch {
        return "/";
    }
};