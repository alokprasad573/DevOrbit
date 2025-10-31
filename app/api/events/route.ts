import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import {Buffer} from "node:buffer";
import {v2 as cloudinary} from "cloudinary";

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

       const file = formData.get('image') as File;
       if (!file) {
           return NextResponse.json({message: 'Image File Required.'}, {status : 400})
       }

       const arrayBuffer = await file.arrayBuffer();
       const buffer  =  Buffer.from(arrayBuffer);

       const uploadResult = await new Promise((resolve, reject) => {
           cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevOrbit'}, (err, results) => {
               if (err) {
                   return reject(err);
               }
               resolve(results);
           }).end(buffer);
       });

       event.image = (uploadResult as {secure_url: string}).secure_url;

       const createdEvent: Event = await Event.create(event);

       return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, {status: 201});
    } catch (e) {
        return NextResponse.json({
            message: 'Event Creation Failed',
            error: e instanceof Error ? e.message : 'Unknown Error'
        }, { status: 500 });
    }
}

export async function GET () {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Event fetched successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed.', error: e }, { status: 500 });
    }
}