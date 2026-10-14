'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/actions/event.action";
import { useAuthModal } from "@/components/AuthModalProvider";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type EditableEvent = {
    _id: string; title: string; description: string; overview: string; image: string; venue: string; location: string;
    date: string; time:string; mode: string; audience: string; agenda: string[]; organizer: string; tags: string[];
};

const CreateEventForm = ({ onClose, event }: { onClose: () => void; event?:EditableEvent }) => {
    const isEdit = !!event;
    const router = useRouter();
    const { openAuth } = useAuthModal();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // Free the temporary preview URL when it changes or the form closes
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        const formData = new FormData(e.currentTarget);
        const image = formData.get("image");
        if (image instanceof File && image.size > MAX_IMAGE_BYTES) {
            setError("Image must be under 4 MB.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = isEdit ? await updateEvent(event._id, formData) : await createEvent(formData);

            if (result.success) {
                onClose();
                if (isEdit) router.refresh();
                else router.push(`/events/${result.slug}`);
                return;
            }

            if (result.code === "unauthenticated") {
                // Session expired while typing: ask for login on top, keep the form's content
                setError("Your session expired. Log in, then press Create event again.");
                openAuth({ mode: "login", reason: "Your session expired. Log in to continue." });
            } else {
                setError(result.error);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="create-form">
            <label className="full">
                Title
                <input name="title" defaultValue={event?.title} maxLength={100} placeholder="e.g. React Summit 2027" required />
            </label>

            <label className="full">
                Description
                <textarea name="description" defaultValue={event?.description} rows={2} maxLength={1000}
                          placeholder="One or two sentences that sell the event" required />
            </label>

            <label className="full">
                Overview
                <textarea name="overview" defaultValue={event?.overview} rows={3} maxLength={500} required />
            </label>

            <label className="full">
                Banner image
                <input name="image" type="file" accept="image/*" onChange={handleImageChange} required={!isEdit} />
                {(preview ?? event?.image) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(preview ?? event?.image)!} alt="Selected banner preview" className="preview" />
                )}
            </label>

            <label>Venue<input name="venue" defaultValue={event?.venue} required /></label>
            <label>Location<input name="location" defaultValue={event?.location} placeholder="City, Country" required /></label>
            <label>Date<input name="date" defaultValue={event?.date} type="date" required /></label>
            <label>Time<input name="time" defaultValue={event?.time} type="time" required /></label>

            <label>
                Mode
                <select name="mode" required defaultValue={event?.mode ?? ""}>
                    <option value="" disabled>Select mode</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                </select>
            </label>
            <label>Audience<input name="audience" defaultValue={event?.audience} placeholder="e.g. Frontend developers" required /></label>

            <label className="full">
                Agenda (one item per line)
                <textarea name="agenda" defaultValue={event?.agenda.join("\n")} rows={4} placeholder={"9:00 Registration\n10:00 Keynote"} required />
            </label>

            <label>Organizer<input name="organizer" defaultValue={event?.organizer} required /></label>
            <label>Tags (comma separated)<input name="tags" defaultValue={event?.tags.join(", ")} placeholder="react, ai, web" required /></label>

            {error && <p role="alert" className="error full">{error}</p>}

            <div className="actions full">
                <button type="button" onClick={onClose}>Cancel</button>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save changes" : "Create event")}
                </button>
            </div>
        </form>
    );
};

export default CreateEventForm;