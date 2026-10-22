import { Suspense } from "react";
import {notFound} from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import {IEvent} from "@/database/event.model";
import {getEventBySlug, getSimilarEventsBySlug} from "@/lib/actions/event.action";
import EventCard from "@/components/EventCard";
import { cacheLife } from "next/cache";
import { getSession} from "@/lib/session";
import { getBookingCount, hasBooked} from "@/lib/actions/booking.action";
import DeleteEventButton from "@/components/DeleteEventButton";
import EditEventButton from "@/components/EditEventButton";
import { isPastEvent } from "@/lib/event-date";
import ShareButton from "@/components/ShareButton";
import type { Metadata } from "next";

async function getEvent(slug: string) {
    "use cache";
    cacheLife("hours");

    return await getEventBySlug(slug);
}
export async function generateMetadata({ params } : { params: Promise<{ slug: string}>}): Promise<Metadata> {
    const { slug } = await params;
    const event = await getEvent(slug);
    if (!event) return {title: "Event not found"};

    const description = String(event.overview ?? event.description ?? "").slice(0, 200);
    //Ask cloudinary  for a  1200X630 crop: the size share cards use
    const image = String(event.image).replace("/upload/", "/upload/c_fill,w_1200,_630,q_auto,f_jpg/");

    return {
        title: event.title,
        description,
        alternates: { canonical: `/events/${slug}`},
        openGraph: {
            title: event.title,
            description,
            url: `/events/${slug}`,
            siteName: "DevEvents",
            type: "website",
            images: [{ url: image, width: 1200, height: 630, alt: event.title }],
        },
        twitter: { card: "summary_large_image", title: event.title, description, images: [image] },
    };
}

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{ label }</p>
    </div>
)

const EventAgenda = ({agendaItems}: {agendaItems: string[]}) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
)

const EventTags = ({ tags }: {tags: string[]}) => (
    <div className="flex flex-row-gap-2 flex-wrap">
        {tags.map((tag) => (
            <div className="pill" key={tag}>{tag}</div>
        ))}
    </div>
)

const EventDetails = async ({ params }: { params: Promise<{ slug: string}>})=>{
    const { slug } = await params;


    const event = await getEvent(slug);
    if (!event?.description) return notFound();

    const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;

    const session = await getSession();

    const canManage = !!session && (session.role ==="admin" || String(event.createdBy ?? "") === session.userId);

    const [similarEvents, bookings, alreadyBooked] = await Promise.all([

        getSimilarEventsBySlug(slug),
        getBookingCount(event._id),
        hasBooked(event._id),
    ]);
    const ended =isPastEvent(date);

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p>{description}</p>
                <ShareButton slug={event.slug} />
            </div>
            <div className="details">
                {/* left Side - Event details*/}
                <div className="content">
                    <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                    </section>

                    <EventAgenda agendaItems={agenda} />

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={tags} />
                </div>
                {/* Right Side - Booking form*/}
                <aside className="booking">
                    <div className="signup-card">
                        <h2>{ended ? "Event Ended" : "Book Your Spot"}</h2>
                        {!ended && (
                            bookings > 0 ? (
                            <p className="text-sm">Join { bookings} people who have already booked their spot!</p>
                        ): (
                            <p className="text-sm">Be the first to book your spot!</p>
                            )
                        )}
                        <BookEvent
                            eventId={event._id}
                            slug={event.slug}
                            userName={session?.name ?? null}
                            alreadyBooked={alreadyBooked}
                            ended={ended}
                        />
                    </div>
                    {canManage && (
                        <div className="card-actions">
                            <EditEventButton event={event} />
                            <DeleteEventButton eventId={String(event._id)} redirectTo="/" />
                        </div>
                    )}
                </aside>
            </div>
            <div className="flex w-full flex-col gap-4 pt-20">
                <h2 className="text-2xl font-bold">Similar Events</h2>

                <div className="events">
                    {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
                        <EventCard key={similarEvent.title} {...similarEvent} ended={isPastEvent(similarEvent.date)} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const EventDetailsPage = ({ params }: { params: Promise<{ slug:string}>}) => {

    return(
    <Suspense fallback={<div className="p-10">Loading Event...</div>}>
            <EventDetails params={params} />
    </Suspense>

    );
};

export default EventDetailsPage
