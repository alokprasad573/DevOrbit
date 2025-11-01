'use client';
import {FormEvent, useState} from "react";
import createBooking from "@/lib/actions/booking.actions";

const Booking = ({eventId, slug}: {eventId: string, slug: string}) => {

    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent) => {

        const { success, error} = await createBooking({eventId, slug, email});


        if (success) setSubmitted(true);
        else console.error("Error creating booking", error);

        e.preventDefault();
        setTimeout(() => {
            setSubmitted(true);
        },1000)
    }
    return (
        <div id="book-event">
            { submitted ? (
                <p className="tetx-base">Thank you for signing up!</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input type="email"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               id="email"
                        placeholder="Email Address" />
                    </div>

                    <button type="submit" className="button-submit">Submit</button>
                </form>
            )}
        </div>
    )
}


export default Booking;