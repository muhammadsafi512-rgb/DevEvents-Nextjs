import { Suspense } from "react";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import LoginPrompt from "@/components/LoginPrompt";
import CreateEventButton from "@/components/CreateEventButton";
import { PublicEvent } from "@/database/event.model";
import { getSession } from "@/lib/session";
import { getMyEvents, getMyBookedEvents } from "@/lib/actions/event.action";
import DeleteEventButton from "@/components/DeleteEventButton";
import EditEventButton from "@/components/EditEventButton";
import CancelBookingButton from "@/components/CancelBookingButton";

const MyEvents = async () => {
    const session = await getSession();

    if (!session) {
        return <LoginPrompt message="Log in to see the events you've created and booked." />;
    }

    const [created, booked]: [PublicEvent[], PublicEvent[]] = await Promise.all([
        getMyEvents(),
        getMyBookedEvents(),
    ]);

    return (
        <section id="my-events">
            <div className="my-section">
                <div className="heading">
                    <h3>My Events</h3>
                    <p>Events you&apos;ve created.</p>
                </div>

                {created.length === 0 ? (
                    <div className="empty-state">
                        <p>You haven&apos;t created any events yet.</p>
                        <CreateEventButton label="Create your first event" />
                    </div>
                ) : (
                    <ul className="events">
                        {created.map((event) =>(
                            <li key={event.slug} className="list-none">
                                <EventCard {...event} />
                                <div className="card-actions">
                                    <EditEventButton event={event} />
                                    <DeleteEventButton eventId={String(event._id)} />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

            </div>

            <div className="my-section">
                <div className="heading">
                    <h3>Booked Events</h3>
                    <p>Events you&apos;ve booked a spot for.</p>
                </div>

                {booked.length === 0 ? (
                    <div className="empty-state">
                        <p>You haven&apos;t booked any events yet.</p>
                        <Link href="/" className="btn-primary">Browse events</Link>
                    </div>
                ) : (
                    <ul className="events">
                        {booked.map((event) => (
                            <li key={event.slug} className="list-none">
                                <EventCard {...event} />
                                <div className="card-actions">
                                    <CancelBookingButton eventId={String(event._id)} />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

const MyEventsPage = () => (
    <Suspense fallback={<div className="p-10">Loading your events...</div>}>
        <MyEvents />
    </Suspense>
);

export default MyEventsPage;