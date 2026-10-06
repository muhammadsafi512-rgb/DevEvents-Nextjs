'use client';

import React from 'react';
import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.action";
import posthog from "posthog-js";

const BookEvent = ({ eventId, slug }: {eventId: string, slug: string;}) => {

    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return ;

            setIsSubmitting(true);
            setError(null);
            try {
                const {success, error} = await createBooking({ eventId, slug, email })
                if (success) {
                    setSubmitted(true);
                    posthog.capture('event_booked', {eventId, slug, email});
                } else {
                    setError(error ?? 'Booking Failed');
                }
            } catch (err) {
                setError('Something went wrong, Please try again');
                posthog.captureException(err);
            } finally {
                setIsSubmitting(false);
            }

        }   ;

        return (
            <div id="book-event">
                {submitted ? (
                    <p className="text-sm">Thank you for signing up!</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email">Email Address</label>
                            <input type='email'
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   id="email"
                                   placeholder="Enter your Email Address"
                            />
                        </div>
                        {error && <p className={"text-sm text-red-500"}>{error}</p>}
                        <button type="submit" className="button-submit" disabled={isSubmitting}>
                            {isSubmitting    ? "Submitting...": 'Submit'}
                        </button>
                    </form>
                )}
            </div>
        );
    };
export default BookEvent
