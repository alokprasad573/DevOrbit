import Link from "next/link";
import Image from "next/image";

interface Props {
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

const EventCard = ({ image, title, slug, location, date, time }: Props) => {
    return (
        <Link href={`/events/${slug}`} className="event-card">
            <div className="rounded-lg shadow-md overflow-hidden hover:scale-105 transition">
                <Image
                    src={image}
                    alt={title}
                    width={410}
                    height={300}
                    className="w-full object-cover"
                />
                <div className="p-4">
                    <div className="flex flex-row gap-2">
                        <Image src="/icons/pin.svg" alt="location" width={14} height={14} />
                        <p className="text-sm text-gray-600">{location}</p>
                    </div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <div className="flex flex-row gap-2">
                        <Image src="/icons/calendar.svg" alt="date&time" width={14} height={14} />
                        <p className="text-sm text-gray-500">{date}</p>
                        <div className= "flex flex-row gap-2">
                            <Image src="/icons/clock.svg" alt="date&time" width={14} height={14} />
                            <p className="text-sm text-gray-500">{time}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;