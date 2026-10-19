import ExploreBtn from "@/components/ExploreBtn";
import EventsBrowser from "@/components/EventsBrowser";
import { cacheLife, cacheTag } from "next/cache";
import { getEvents } from "@/lib/actions/event.action";
import { isPastEvent } from "@/lib/event-date";
import type { PublicEvent } from "@/database/event.model";

const Page = async () => {
  'use cache';
  cacheLife('hours');
  cacheTag('events');

  const events: PublicEvent[] = await getEvents();
  const withStatus = events.map((event) => ({ ...event, ended: isPastEvent(event.date) }));

  return (
      <section>
        <h1 className="text-center">The Hub for Every Dev <br/>  Event You Can't Miss</h1>
        <p className="text-center mt-5">Hackathons, Meetups, & Conferences, All in One Place </p>

        <ExploreBtn/>

        <div id="events" className="scroll-mt-20">
          <EventsBrowser events={withStatus} />
        </div>

        {events.length === 0 && <p className="mt-20 text-center">No events yet.</p>}
      </section>
  )
}
export default Page