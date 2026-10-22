import { site } from "@/lib/site";

export const baseUrl = () => process.env.NODE_ENV === "production" ? site.url : "http://localhost:3000";