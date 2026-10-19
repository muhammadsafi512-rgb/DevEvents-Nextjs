'use server';

import Booking from '@/database/booking.model';
import User from '@/database/user.model';
import connectDB from "@/lib/mongodb";
import {getSession} from "@/lib/session";
import { isValidObjectId} from "mongoose";
import { rateLimit} from "@/lib/rate-limit";
import Event from "@/database/event.model";
import { isPastEvent} from "@/lib/event-date";

export type BookingResult =
    | { success: true }
    | { success: false; error: string; code?: "unauthenticated" };

export type CancelBookingResult =
    | { success: true }
    | { success: false; error: string; code?: "unauthenticated" };

export const createBooking =  async ({ eventId }: { eventId: string }): Promise<BookingResult> => {
    //The user always comes from the verified session, never from the client
    const session = await getSession();
    if (!session) {
        return { success: false, error: "Please Login to book your spot.", code: "unauthenticated" };
    }

    try {
        await connectDB()
        if (!isValidObjectId(eventId)) {
            return { success:false, error: "This event could not be found."};
        }
        const event = await Event.findById(eventId).select("date").lean();
        if (!event) {
            return { success: false, error: "This event could not be found."};
        }
        if (isPastEvent(event.date)) {
            return { success: false, error: "This event has already ended."};
        }

        const user = await User.findById(session.userId).select("email");
        if (!user) {
            return {success: false, error: "Your account was not found. Please login", code: "unauthenticated" };
        }

        await Booking.create({ eventId, userId: session.userId, email: user.email });
        return { success: true};

    } catch (e: any) {
        if (e?.code === 11000){
            return {success: false, error: "You've already booked this event." };
        }
        if (e?.name === "ValidationError") {
            return {success: false, error: "This event could not be found."};
        }
        console.error("createBooking failed:", e);
        return {success: false, error: "Could not create Booking. Please try again." };
    }
};

export const cancelBooking = async (eventId: string) : Promise<CancelBookingResult> => {
    const session = await getSession();
    if (!session) {
        return { success: false, error: "Please login first.", code: "unauthenticated" };
    }
    if (!isValidObjectId(eventId)) return { success: false, error: "Invalid Event."};

    try {
        if (!(await rateLimit(`cancel-booking:${session.userId}`, 20, 60*60)).ok) {
            return { success:false, error: "Too many requests. Please try later."};
        }

        await connectDB();

        const event = await Event.findById(eventId).select("date").lean();
        if (!event) {
            return {success: false, error: "This event could not be found."};
        }
        if (isPastEvent(event.date)) {
            return { success: false, error: " This event has ended, so you cannot cancel the booking anymore."};
        }

        const user = await User.findById(session.userId).select("email");
        if (!user) return { success: false, error: "Account not found."};

        //Match by user id, or by the account email (older bookings have no userId)
        const result = await Booking.deleteMany({
            eventId, $or: [{ userId: session.userId }, { email: user.email }],
        });

        if (result.deletedCount === 0) {
            return { success: false, error: "You don't have a booking for this event." };
        }
        return { success: true };
    } catch (e) {
        console.error("cancelBooking error:", e);
        return { success: false, error: "Could not cancel Booking. Please try again." };
    }
}

export const getBookingCount = async (eventId: string): Promise<number> => {
    try {
        await connectDB();
        return await Booking.countDocuments({ eventId });
    } catch {
        return 0;
    }
};

//True if the logged-in user already has a booking for this event
export const hasBooked = async (eventId: string): Promise<boolean> => {
    const session = await getSession();
    if (!session) return false;
    try {
        await connectDB();
        const user = await User.findById(session.userId).select("email").lean();
        if (!user) return false;

        //The email match also catches older bookings that were made  before  accounts existed
        const booking = await Booking.exists({
            eventId,
            $or: [{ userId: session.userId }, { email: user.email }],
        });
        return !!booking;
    } catch {
        return false;
    }
};