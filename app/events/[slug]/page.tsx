import {notFound} from "next/navigation";
import Image from "next/image";
import Booking from "@/components/Booking";
import getSimilarEventBySlug from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import {cacheLife} from "next/cache";


const BASE_URL = 'http://localhost:3000'


const EventDetailsItem = ({icon, alt, label ,data}: {icon: string; alt: string, label: string, data:string}) => {
    return (
        <div className="flex-row-gap-2">
            <Image src={icon} alt={alt} width={17} height={17}/>
            <p>{label}: {data}</p>
        </div>
    )
}

const EventAgenda = ({agendaItems}: {agendaItems: string[]}) => {
    return (
        <div className='agenda'>
            <h2>Agenda</h2>
            <ul>
                {agendaItems.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    )
}

const EventTags = ({tags}: {tags: string[]}) => {
    return (
        <div className="flex flex-row gap-1.5 flex-wrap">
            {tags.map((item) => (
                <div className="pill" key={item}>{item}</div>
            ))}
        </div>
    )
}
const EventDetailsPage = async ({ params } : { params: Promise<{slug: string}>}) => {

    'use cache'
    cacheLife('hours')
    const { slug } = await params;
    const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        cache: "no-cache"
    });

    const { event } = await request.json();
    if (!event) return notFound();

    const {id, title, description, overview, image, venue, location, date, time, mode, audience, agenda, organizer, tags} = event;
    const address = `${venue}, ${location}`;

    const bookings = 10;

    const similarEvents = await getSimilarEventBySlug(slug);
    return (
        <section id="event">
            <div className="header">
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
            <div className="details">
                {/*Event Content*/}
                <div className="content">
                    <Image src={image} alt="Event Banner" width={800} height={800} className="banner"/>
                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>
                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        <EventDetailsItem icon="/icons/calendar.svg" alt='claendar' label="Date" data={date}/>
                        <EventDetailsItem icon="/icons/clock.svg" alt='clock' label="Time" data={time}/>
                        <EventDetailsItem icon="/icons/pin.svg" alt='pin' label="Venue" data={address}/>
                        <EventDetailsItem icon="/icons/mode.svg" alt='mode' label="Mode" data={mode}/>
                        <EventDetailsItem icon="/icons/audience.svg" alt='audience' label="Audience" data={audience}/>
                    </section>

                    <EventAgenda agendaItems={agenda} />

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={tags}/>
                </div>
                {/*Event Booking Form*/}
                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">
                                Join peoples who have already booked their spot!
                            </p>
                        ) : (
                            <p className="text-sm">Be the first to book your spot</p>
                        )}
                        <Booking eventId={event._id} slug={event.slug}  />
                    </div>
                </aside>
            </div>

            {similarEvents.length > 0 && (
                <div className="flex w-full flex-col gap-4 pt-20">
                    <h2>Similar Events</h2>
                    <div className="events">
                        {similarEvents.map((similarEvent) => (
                            <EventCard key={similarEvent.title} {...similarEvent} />
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}

export default EventDetailsPage;