import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service" };

const TermsPage = () => (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 text-light-100">
        <h1>Terms of Service</h1>
        <p className="text-light-200 text-sm">Last updated: October 22, 2026</p>

        <p>By using {site.name} you agree to these terms.</p>

        <h2 className="text-2xl font-bold">Your account</h2>
        <p>
            You are responsible for keeping your login details safe and for activity on
            your account. Provide accurate information when signing up or booking.
        </p>

        <h2 className="text-2xl font-bold">Events you post</h2>
        <p>
            You are responsible for the events and images you publish. Do not post
            unlawful, misleading, hateful or infringing content. We may remove events or
            accounts that break these rules.
        </p>

        <h2 className="text-2xl font-bold">Bookings</h2>
        <p>
            Bookings are a registration of interest with the event organizer. We do not
            guarantee that any event will take place or that attendance is confirmed.
        </p>

        <h2 className="text-2xl font-bold">Availability and liability</h2>
        <p>
            The service is provided as is, without warranties. To the extent permitted by
            law, we are not liable for losses arising from use of the site or from events
            listed on it.
        </p>

        <h2 className="text-2xl font-bold">Changes and contact</h2>
        <p>
            We may update these terms and will change the date above when we do. Contact:{" "}
            <a className="text-primary underline" href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
    </article>
);

export default TermsPage;