import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

const PrivacyPage = () => (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 text-light-100">
        <h1>Privacy Policy</h1>
        <p className="text-light-200 text-sm">Last updated: October 22, 2026</p>

        <p>
            {site.name} is a platform for discovering and booking developer events.
            This policy explains what we collect and how we use it.
        </p>

        <h2 className="text-2xl font-bold">What we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
            <li>Account details: your name, email address and a hashed password (we never store your plain password).</li>
            <li>If you sign in with Google: your name and verified email address from your Google account. We do not access your contacts, files or any other Google data.</li>
            <li>Bookings you make and events you create, including images you upload.</li>
            <li>A session cookie that keeps you logged in, and basic usage analytics (PostHog).</li>
        </ul>

        <h2 className="text-2xl font-bold">How we use it</h2>
        <p>
            To run your account, show your bookings, let you create and manage events,
            send password reset emails, protect the site from abuse, and understand how
            the site is used. We do not sell your data or use it for advertising.
        </p>

        <h2 className="text-2xl font-bold">Who processes it</h2>
        <p>
            We use trusted providers to run the service: MongoDB Atlas (database),
            Cloudinary (images), Netlify (hosting), PostHog (analytics) and an email
            service for password reset messages.
        </p>

        <h2 className="text-2xl font-bold">Your choices</h2>
        <p>
            You can ask us to correct or delete your account and data at any time by
            emailing <a className="text-primary underline" href={`mailto:${site.email}`}>{site.email}</a>.
        </p>

        <h2 className="text-2xl font-bold">Contact</h2>
        <p>
            Questions about this policy: <a className="text-primary underline" href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
    </article>
);

export default PrivacyPage;