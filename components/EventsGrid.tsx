import EventCard from "./EventCard";
import events  from "../lib/constants";

const EventsGrid = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
                <EventCard key={event.slug} {...event} />
            ))}
        </div>
    );
};

export default EventsGrid;