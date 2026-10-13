import {NextRequest, NextResponse} from "next/server";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model"

export async function GET(){
    try {
        await connectDB();

        const events = await Event.find().sort({createdAt: -1});

        return NextResponse.json({message: 'Events fetched successfully', events }, { status: 200});
        
    } catch (e) {
        return NextResponse.json({message:'Event fetching failed'}, { status: 500});
    }
}