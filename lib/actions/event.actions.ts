'use server';

import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";

const getSimilarEventBySlug = async (slug: string) => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug });
        if (!event) return [];

        const similarEvents = await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags }
        }).lean();

        return similarEvents;
    } catch (error) {
        console.error("Error fetching similar events:", error);
        return [];
    }
};

export default getSimilarEventBySlug;