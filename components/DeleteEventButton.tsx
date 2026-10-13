'use client';

import {useRouter} from "next/navigation";
import {useState} from "react";
import {deleteEvent} from "@/lib/actions/event.action";

interface Props {
    eventId: string;
    redirectTo?: string;
}

export default function DeleteEventButton({ eventId, redirectTo }: Props) {
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete() {
        setBusy(true);
        setError("");
        const res = await deleteEvent(eventId);
        if (!res.ok) {
            setError(res.error);
            setBusy(false);
            return;
        }
        if (redirectTo) router.push(redirectTo);
        router.refresh();
    }
    if (!confirming) {
        return (
            <button type="button" className="btn-delete" onClick={()=> setConfirming(true)}>
                Delete
            </button>
        );
    }

    return (
        <div className="delete-confirm">
            <p>Delete this event? Its bookings will also be removed.</p>
            <div className="actions">
                <button type="button" className="btn-danger" onClick={handleDelete} disabled={busy}>
                    {busy ? "Deleting...": "Yes, Delete"}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setConfirming(false)} disabled={busy}>
                    Cancel
                </button>
            </div>
            { error && <p className="error">{error}</p> }
        </div>
    )
}