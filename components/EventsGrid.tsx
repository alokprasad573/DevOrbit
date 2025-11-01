import EventCard from "./EventCard";
import {IEvent} from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventsGrid = async () => {

    const response = await fetch(`${BASE_URL}/api/events`, {
        method: "GET",
        headers: {

            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    });

    const { events } = await response.json();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events && events.map((event: IEvent) => (
                <EventCard key={event.title} {...event} />
            ))}
        </div>
    );
};

export default EventsGrid;