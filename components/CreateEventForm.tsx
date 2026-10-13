'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/actions/event.action";
import { useAuthModal } from "@/components/AuthModalProvider";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const CreateEventForm = ({ onClose }: { onClose: () => void }) => {
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
            const result = await createEvent(formData);

            if (result.success) {
                onClose();
                router.push(`/events/${result.slug}`);
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
                <input name="title" maxLength={100} placeholder="e.g. React Summit 2027" required />
            </label>

            <label className="full">
                Description
                <textarea name="description" rows={2} maxLength={1000}
                          placeholder="One or two sentences that sell the event" required />
            </label>

            <label className="full">
                Overview
                <textarea name="overview" rows={3} maxLength={500} required />
            </label>

            <label className="full">
                Banner image
                <input name="image" type="file" accept="image/*" onChange={handleImageChange} required />
                {preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Selected banner preview" className="preview" />
                )}
            </label>

            <label>Venue<input name="venue" required /></label>
            <label>Location<input name="location" placeholder="City, Country" required /></label>
            <label>Date<input name="date" type="date" required /></label>
            <label>Time<input name="time" type="time" required /></label>

            <label>
                Mode
                <select name="mode" required defaultValue="">
                    <option value="" disabled>Select mode</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                </select>
            </label>
            <label>Audience<input name="audience" placeholder="e.g. Frontend developers" required /></label>

            <label className="full">
                Agenda (one item per line)
                <textarea name="agenda" rows={4} placeholder={"9:00 Registration\n10:00 Keynote"} required />
            </label>

            <label>Organizer<input name="organizer" required /></label>
            <label>Tags (comma separated)<input name="tags" placeholder="react, ai, web" required /></label>

            {error && <p role="alert" className="error full">{error}</p>}

            <div className="actions full">
                <button type="button" onClick={onClose}>Cancel</button>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create event"}
                </button>
            </div>
        </form>
    );
};

export default CreateEventForm;