'use server';

import Booking from '@/database/booking.model';
import connectDB from "@/lib/mongodb";

interface InterFaceBooking {
    eventId: string;
    slug: string;
    email: string;
}

const createBooking = async ({ eventId, slug, email } : InterFaceBooking) => {
    try {
        await connectDB();
        const booking = await Booking.create({ eventId, slug, email });

        return { success: true, booking };
    } catch (e) {
        console.error("", e);
        return { success: false, error: e };
    }
}


export default createBooking;