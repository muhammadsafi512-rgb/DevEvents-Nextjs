'use client';

import {useRouter} from "next/navigation";
import {useState} from "react";
import {cancelBooking} from "@/lib/actions/booking.action";

const CancelBookingButton = ({ eventId, onCancelled, }: { eventId: string; onCancelled?: () => void; }) => {
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    async function handleCancel() {
        setBusy(true);
        setError("");
        const res = await cancelBooking(eventId);
        if (!res.success) {
            setError(res.error);
            setBusy(false);
            return;
        }
        onCancelled?.();
        router.refresh();
    }

    if (!confirming) {
        return (
            <button type="button" className="btn-delete" onClick={() => setConfirming(true)}>
                Cancel booking
            </button>
        );
    }

    return (
        <div className="delete-confirm">
            <p>Cancel your booking for this event?</p>
            <div className="actions">
                <button type="button" className="btn-danger" onClick={handleCancel} disabled={busy}>
                    {busy ? "Cancelling..." : "Yes, cancel booking"}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setConfirming(false)} disabled={busy} >
                    Keep Booking
                </button>
            </div>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default CancelBookingButton;