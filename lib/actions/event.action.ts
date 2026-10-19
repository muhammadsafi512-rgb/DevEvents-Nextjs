'use server';

import { v2 as cloudinary} from "cloudinary";
import Event from '@/database/event.model'
import connectDB from "@/lib/mongodb";
import { updateTag } from "next/cache";
import { getSession } from "@/lib/session";
import User from '@/database/user.model';
import Booking from '@/database/booking.model';
import { isValidObjectId} from "mongoose";
import { rateLimit} from "@/lib/rate-limit";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type CreateEventResult = | { success:true; slug:string }
                                | { success:false; error:string; code?:"unauthenticated" };
export type UpdateEventResult = | { success:true; slug:string }
                                | { success:false; error:string; code?:"unauthenticated" };

async function destroyCloudinaryImage(url?: string) {
    try {
        const match = url?.match(/\/upload\/(?:v\d+\/)?(DevEvent\/.+)\.[a-z0-9]+$/i);
        if (match) await cloudinary.uploader.destroy(match[1]);
    } catch {

    }
}

export const createEvent = async (formData: FormData) : Promise<CreateEventResult> => {
    //Server side login check
    const session = await getSession();
    if (!session) {
        return { success: false, error: "Please Login to create an event.", code: "unauthenticated" };
    }

    try {
        if (!(await rateLimit(`create-event:${session.userId}`, 10, 60*60)).ok) {
            return { success:false, error: "You're creating events too quickly. Please try again later." };
        }
        const get = ( k: string) => String(formData.get(k) ?? "").trim();

        const data ={
            title: get("title"),
            description: get("description"),
            overview: get("overview"),
            venue: get("venue"),
            location: get("location"),
            date: get("date"),
            time: get("time"),
            mode: get("mode"),
            audience: get("audience"),
            organizer: get("organizer"),
            agenda: get("agenda").split("\n").map((s) => s.trim()).filter(Boolean),
            tags: get("tags").split(",").map((s) => s.trim()).filter(Boolean),
        };

        //Required Field Validation
        const missing = Object.entries(data)
            .filter(([, v]) => (Array.isArray(v) ? v.length === 0 : !v))
            .map(([k]) => k);
        if (missing.length) {
            return { success: false, error: `Missing: ${missing.join(", ")}`};
        }

        //Image validation + upload
        const file = formData.get("image");
        if (!(file instanceof File) || file.size === 0) {
            return {success: false, error: "Please Choose An Image."};
        }
        if (!file.type.startsWith("image")) {
            return {success: false, error: "File must be an Image."};
        }
        if ( file.size > MAX_IMAGE_BYTES ) {
            return {success: false, error: "Image must be under 4 MB."};
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const upload = await new Promise<{ secure_url: string}>((resolve, reject) => {
            cloudinary.uploader.upload_stream({ folder: "DevEvent", resource_type: "image" }, (err,res) => err || !res  ? reject(err) : resolve(res as any)).end(buffer);
        });

        await connectDB();
        const event = await Event.create({ ...data, image: upload.secure_url, createdBy: session.userId, });

        updateTag("events"); //for refreshing the cached home page list
        return { success: true, slug: event.slug as string };

    } catch (e: any) {
        if (e?.code === 11000) {
            return {success: false, error: "An event with title already exists."};
        }
        if (e?.name === "ValidationError") {
            const first = Object.values(e.errors)[0] as { message?: string} | undefined;
            return { success: false, error: first?.message ?? "Invalid event data."};
        }
        console.error("createEvent error: ",e);
        return {success: false, error: "Could not create event."};
    }
};

export async function updateEvent(eventId: string, formData: FormData): Promise<UpdateEventResult> {
    const session = await getSession();
    if (!session) {
        return { success: false, error: "Please login to edit this event.", code: "unauthenticated"};
    }
    if (!isValidObjectId(eventId)) return { success: false, error: "Invalid Event."};

    try {
        if (!(await rateLimit(`edit-event:${session.userId}`, 20, 60*60)).ok) {
            return { success: false, error: "You're editing too quickly. Please try again later."};
        }

        await connectDB();

        const event = await Event.findById(eventId).select("createdBy image slug");
        if (!event) return { success: false, error: "Event not found." };

        //re-check the role in the DB: the token role's role could be stale
        const user = await User.findById(session.userId).select("role");
        const isAdmin = user?.role === "admin";
        const isOwner = !!event.createdBy && String(event.createdBy) === session.userId;
        if (!isAdmin && !isOwner) return { success: false, error: " You can't edit this event." };

        const get = (k: string) => String(formData.get(k) ?? "").trim();
        const data = {
            title: get("title"),
            description: get("description"),
            overview: get("overview"),
            venue: get("venue"),
            location: get("location"),
            date: get("date"),
            time: get("time"),
            mode: get("mode"),
            audience: get("audience"),
            organizer: get("organizer"),
            agenda: get("agenda").split("\n").map((s) => s.trim()).filter(Boolean),
            tags: get("tags").split(",").map((s) => s.trim()).filter(Boolean),
        };

        const missing = Object.entries(data)
            .filter(([, v]) => (Array.isArray(v) ? v.length === 0 : !v)).map(([k]) =>k);
        if (missing.length) return { success:false, error: `Missing: ${missing.join(", ")}`};

        //The image is optional in edit , only replace when a new file is chosen
        let newImage: string | undefined;
        const file = formData.get("image");
        if (file instanceof File && file.size > 0) {
            if (!file.type.startsWith("image")) return { success: false, error: "File must an Image."};
            if (file.size > MAX_IMAGE_BYTES) return { success: false, error: "Image must be under 4 MB."};

            const buffer = Buffer.from(await file.arrayBuffer());
            const upload = await new Promise<{ secure_url: string}>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder: "DevEvent", resource_type: "image" }, (err, res) =>
                err || !res ? reject(err) : resolve(res as any)).end(buffer);
            });
            newImage = upload.secure_url;
        }

        //UpdateOne (not save):  the pre-save hook would regenerate the slug when the title changes
        await Event.updateOne(
            { _id: event._id },
            { $set: { ...data, ...(newImage ? { image: newImage } : {}) } },
            { runValidators: true }
        );

        if (newImage) await destroyCloudinaryImage(event.image);

        updateTag("events");
        return { success: true, slug: event.slug as string };
    } catch (e: any) {
        if (e?.name === "ValidationError") {
            const first = Object.values(e.errors)[0] as { message?: string | undefined};
            return { success: false, error: first?.message ?? "Invalid event data."};
        }
        console.error("createEvent error: ",e);
        return { success: false, error: "Could not update event."};
    }
}

// Keeps only what th UI needs from the owner: never the email or password hash
const toPublicEvent = (event: any) => {
    const { createdBy, ...rest } = event;
    return {
        ...rest,
        createdBy: createdBy?._id ? String(createdBy._id): null,
        creatorName: createdBy?.name ?? null,
        featured: createdBy?.role === "admin",
    };
};

export const getEvents = async () => {
    await connectDB();
    const events = await Event.find().sort({createdAt: -1}).populate("createdBy","name role").lean();
    return JSON.parse(JSON.stringify(events.map(toPublicEvent)));
};

export const getEventBySlug = async (slug: string) => {
    await connectDB();
    const event = await Event.findOne({ slug }).populate("createdBy", "name role").lean();
    return event ? JSON.parse(JSON.stringify((toPublicEvent)(event))) : null;
};

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB()
        const event = await Event.findOne({slug}).lean();
        if (!event) return [];

        const similarEvents = await Event.find({
            _id: {$ne: event._id},
            tags: {$in: event.tags}
        }).populate("createdBy", "name role").lean();

        return JSON.parse(JSON.stringify(similarEvents.map(toPublicEvent)));
    } catch {
        return [];
    }
};
export const getMyEvents = async () => {
    const session = await getSession();
    if (!session) return [];

    await connectDB()
    const events = await Event.find({ createdBy: session.userId })
        .sort({ createdAt: -1 })
        .populate("createdBy", "name role").lean();

    return JSON.parse(JSON.stringify(events.map(toPublicEvent)));
};

export const getMyBookedEvents = async () => {
    const session = await getSession();
    if (!session) return [];

    try {
        await connectDB();

        const user = await User.findById(session.userId).select("email").lean();
        if (!user) return [];

        const bookings = await Booking.find({
            $or: [{ userId: session.userId }, {email:user.email}],
        }).select("eventId").lean();

        const eventIds = bookings.map((booking: any)=> booking.eventId);
        if (eventIds.length === 0) return [];

        const events = await Event.find({ _id: { $in: eventIds } })
            .populate("createdBy", "name role").lean();

        const today = new Date().toISOString().split("T")[0];
        const list = events.map(toPublicEvent);
        const upcoming= list
            .filter((e:any)=> e.date >= today)
            .sort((a:any ,b:any)=> a.date.localeCompare(b.date));
        const past = list
            .filter((e: any)=> e.date < today)
            .sort((a:any, b:any)=> b.date.localeCompare(a.date));

        return JSON.parse(JSON.stringify([...upcoming, ...past]));
    } catch (e) {
        console.error("getMyBookedEvents error: ", e);
        return [];
    }
};

export type DeleteEventResult = { ok: true } | { ok: false ; error: string};

export async function deleteEvent(eventId: string): Promise<DeleteEventResult> {
    const session = await getSession();
    if (!session) return {ok: false, error: "Please login first." };
    if (!isValidObjectId(eventId)) return { ok:false, error: "Invalid event id." };

    await connectDB();

    const event = await Event.findById(eventId).select("createdBy slug");
    if (!event) return {ok: false, error: "Event not found."};

    //Re-Check the role in the DB: token's role can be stale
    const user = await User.findById(session.userId).select("role");
    const isAdmin = user?.role === "admin";
    const isOwner = !!event.createdBy && String(event.createdBy) === session.userId;
    if (!isAdmin && !isOwner) {
        return {ok: false, error: "You can't delete this event."};
    }

    //Soft delete: keep the event, its booking and its image as record.
    //The slug is renamed so the original name can be used by a new event with the same title.

    await Event.updateOne(
        { _id: event._id},
        {
            $set: {
                deletedAt: new Date(),
                deletedBy: session.userId,
                slug: `${event.slug}-deleted-${event._id}`,
            },
        }
    );

    updateTag("events");
    return { ok: true};
}

