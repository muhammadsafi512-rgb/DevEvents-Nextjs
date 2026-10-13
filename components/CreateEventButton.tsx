'use client';

import { useCreateEventModal} from "@/components/CreateEventModalProvider";

const CreateEventButton = ({ label ="Create Event" }: { label: string}) => {
    const { openCreateEvent } = useCreateEventModal();

    return (
        <button
            type="button"
            className="btn-primary"
            onClick={openCreateEvent}>
            {label}
        </button>
    );
};

export default CreateEventButton;