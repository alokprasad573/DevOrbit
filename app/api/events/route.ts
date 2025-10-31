import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
       await connectDB();

       const formData = await req.formData();

       let event;

       try {
           event = Object.fromEntries(formData.entries());
       } catch (e) {
           return NextResponse.json({ message: 'Invalid JSON data format'}, { status: 400 });
       }

       const createdEvent: Event = await Event.create(event);
       return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, {status: 201});
    } catch (e) {
        return NextResponse.json({
            message: 'Event Creation Failed',
            error: e instanceof Error ? e.message : 'Unknown Error'
        }, { status: 500 });
    }
}

