import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";

const createBooking = async ({eventId, slug, email}: {eventId: string, slug: string, email: string}) => {
    try {
        await connectDB()
        const booking = await Booking.create({ eventId, slug, email });
        return { success: true, booking };
    } catch (e) {
        console.error("Error creating booking event", e);
        return { success: false , error: e};
    }
}



export default createBooking;