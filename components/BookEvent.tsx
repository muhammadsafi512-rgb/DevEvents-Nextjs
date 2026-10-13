'use client';

import {useState} from "react";
import {useRouter} from "next/navigation";
import posthog from "posthog-js";
import {createBooking} from "@/lib/actions/booking.action";
import {useAuthModal} from "@/components/AuthModalProvider";

type Props = {
    eventId: string;
    slug: string;
    userName: string | null; //null when logged out
    alreadyBooked: boolean;
};

const BookEvent = ({ eventId, slug, userName, alreadyBooked }: Props) => {

    const router = useRouter();
    const {openAuth} = useAuthModal();

    const [booked, setBooked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isBooked = alreadyBooked || booked;

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return ;

        if (!userName) {
            openAuth({ mode: "login", reason: "Login to book your spot for this event."});
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createBooking({ eventId });

                if (result.success) {
                    setBooked(true);
                    posthog.capture('event_booked', {eventId, slug });
                    router.refresh();
                    return;
                } else {
                    setError(result.error);
                }
        } catch (err) {
                setError('Something went wrong, Please try again');
                posthog.captureException(err);
        } finally {
                setIsSubmitting(false);
        }

    };

    return (
        <div id="book-event">
            {isBooked ? (
                    <p className="text-sm">You're booked for this event. See you there!</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p className="text-sm">
                            {userName? (
                                <>Booking as <strong>{userName}</strong></>
                            ): (
                                "Login or Signup if you haven't to book your spot."
                            )}
                        </p>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <button type="submit" disabled={isSubmitting}>
                            {userName ? (isSubmitting? "Booking...": "Book my spot"): "Login to book"}
                        </button>
                    </form>
                )}
            </div>
        );
    };
export default BookEvent;
