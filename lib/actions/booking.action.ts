'use server';

import Booking from '@/database/booking.model';
import User from '@/database/user.model';
import connectDB from "@/lib/mongodb";
import {getSession} from "@/lib/session";

export type BookingResult =
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
        if (e?.name === "validationError") {
            return {success: false, error: "This event could not be found."};
        }
        console.error("createBooking failed:", e);
        return {success: false, error: "Could not create Booking. Please try again." };
    }
};

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