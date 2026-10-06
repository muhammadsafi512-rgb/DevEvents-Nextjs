'use server';

import Booking from '@/database/booking.model'
import connectDB from "@/lib/mongodb";

export const createBooking =  async ({eventId, slug, email}: {eventId: string, slug: string, email: string}) => {
    try {
        await connectDB()
        await Booking.create({ eventId, slug, email });
        return {success: true };
        
    } catch (e: any) {
        if (e?.code === 11000){
            return {success: false, error: "You already have a booking with that email"};
        }
        console.error('Create Booking failed', e);
        return {success: false, error: "Could not create Booking. Please try again." };
    }
}