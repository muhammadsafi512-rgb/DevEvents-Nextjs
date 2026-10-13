import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {cacheLife, cacheTag} from "next/cache";
import { getEvents } from "@/lib/actions/event.action";
import { PublicEvent} from "@/database/event.model";

const Page = async () => {
  'use cache';
  cacheLife('hours');
  cacheTag('events');

  const events: PublicEvent[] = await getEvents();
  const featured = events.filter((event) => event.featured);
  const community = events.filter((event) => !event.featured);

  return (
      <section>

      <h1 className="text-center">The Hub for Every Dev <br/>  Event You Can't Miss</h1>
        <p className="text-center mt-5">Hackathons, Meetups, & Conferences, All in One Place </p>

        <ExploreBtn/>
<div id="events" className="scroll-mt-20">
        { featured.length > 0 && (
            <div className="mt-20 space-y-7">
              <h3>Featured Events</h3>
              <ul className="events">
                {featured.map((event) => (
                    <li key={event.slug} className="list-none">
                      <EventCard {...event} />
                    </li>
                ))}
              </ul>
            </div>
        )}

        {community.length > 0 && (
            <div className="mt-20 space-y-7">
              <h3>Community Events</h3>
              <ul className="events">
                {community.map((event) => (
                    <li key={event.slug} className="list-none">
                      <EventCard {...event} />
                    </li>
                ))}
              </ul>
            </div>
        )}
</div>
            {events.length === 0 && <p className="mt-20 text-center">No events yet.</p>}
      </section>
  )
}
export default Page

