'use server';

import Event from '@/database/event.model'
import connectDB from "@/lib/mongodb";

export const getEvents = async () => {
    await connectDB();
    const events = await Event.find().sort({createdAt: -1}).lean();
    return JSON.parse(JSON.stringify(events));
};

export const getEventBySlug = async (slug: string) => {
    await connectDB();
    const event = await Event.findOne({ slug }).lean();
    return event ? JSON.parse(JSON.stringify(event)) : null;
};

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB()
        const event = await Event.findOne({slug}).lean();
        if (!event) return [];

        const similarEvents = await Event.find({
            _id: {$ne: event._id},
            tags: {$in: event.tags}
        }).lean();

        return JSON.parse(JSON.stringify(similarEvents));
    } catch {
        return [];
    }
};