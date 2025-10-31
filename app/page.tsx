import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import EventsGrid from "@/components/EventsGrid";

const Page = () => {
    return(
         <section>
             <h1 className="text-center">
                 The Hub for Every Dev <br/> Event You Can't Miss
             </h1>
             <p className="text-center mt-5">
                 Hackathons, Meetups and Conferences. All in one place
             </p>
             <ExploreBtn/>

             <div className="mt-20 space-y-7">
                 <h3>Feature Events</h3>

                 <EventsGrid/>
             </div>
         </section>
    )
}

export default Page;