const createBooking = async ({
    eventId,
    slug,
    email,
}: {
    eventId: string;
    slug: string;
    email: string;
}) => {
    try {
        const response = await fetch("/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ eventId, slug, email }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error:
                    data?.message ??
                    "Unable to create booking. Please try again later.",
            };
        }

        return { success: true, booking: data.booking };
    } catch (error) {
        console.error("Error creating booking event", error);
        return { success: false, error };
    }
};

export default createBooking;