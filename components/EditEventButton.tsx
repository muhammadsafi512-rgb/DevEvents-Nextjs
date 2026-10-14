'use client';

import { useCreateEventModal } from "@/components/CreateEventModalProvider";
import { PublicEvent } from "@/database/event.model";

const EditEventButton = ({ event } : { event: PublicEvent }) => {
    const { openEditEvent } = useCreateEventModal();

    const handleClick = () =>
        openEditEvent({
            _id: String(event._id),
            title: event.title,
            description: event.description,
            overview: event.overview,
            image: event.image,
            venue: event.venue,
            location: event.location,
            date: event.date,
            time: event.time,
            mode: event.mode,
            audience: event.audience,
            agenda: [...event.agenda],
            organizer: event.organizer,
            tags: [...event.tags],
        });
    return (
        <button type="button" className="btn-edit" onClick={handleClick}>
            Edit
        </button>
    );
};

export default EditEventButton;