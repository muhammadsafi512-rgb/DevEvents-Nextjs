'use client';

import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

interface Props {
    title: string,
    image: string,
    slug: string,
    location: string,
    date: string,
    time: string,
    creatorName?: string | null,
    featured?: boolean,
}

const EventCard = ({ title, image, slug, location, date, time, creatorName, featured }: Props)=> {
    const handleEventSelection = () => {
        if (projectToken && posthogHost) {
            posthog.capture("event_selected", { event_slug: slug });
            posthog.logger.info("event_selected", { event_slug: slug });
        }
    };

    return (
        <Link href={`/events/${slug}`} className="event-card" onClick={handleEventSelection}>
            <div className="poster-wrap">
                <Image src={image} alt={title} width={400} height={300} className="poster" />
                { featured && <span className="featured-badge">Featured</span>}
            </div>

            <div className="flex flex-row gap-2">
                <Image src="/icons/pin.svg" alt="location" width={14} height={14}/>
                <p>{location}</p>
            </div>
            <p className="title">{title}</p>

            <div className="datetime">
                <div>
                    <Image src="/icons/calendar.svg" alt="date" width={14} height={14}/>
                    <p>{date}</p>
                </div>
                <div>
                    <Image src="/icons/clock.svg" alt="time" width={14} height={14}/>
                    <p>{time}</p>
                </div>
            </div>
            { creatorName && (
                <div className="creator">
                    <span className="avatar" aria-hidden="true">
                        { creatorName.trim().charAt(0).toUpperCase()}
                    </span>
                    <p>Created by <strong>{creatorName}</strong></p>
                </div>
            )}
        </Link>
    );
};
export default EventCard
