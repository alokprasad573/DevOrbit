import {FormEvent, useState} from "react";

const Booking = () => {

    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit =  (e: FormEvent) => {
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