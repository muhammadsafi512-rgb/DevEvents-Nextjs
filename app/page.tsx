import ExploreBtn from "@/components/ExploreBtn";
import EventsBrowser from "@/components/EventsBrowser";
import CreateEventButton from "@/components/CreateEventButton";
import { cacheLife, cacheTag } from "next/cache";
import { getEvents } from "@/lib/actions/event.action";
import { isPastEvent } from "@/lib/event-date";
import type { PublicEvent } from "@/database/event.model";

const DEFAULT_CHIPS = ["React", "AI", "DevOps", "Web3", "Cloud", "Open Source"];

const Page = async () => {
  'use cache';
  cacheLife('hours');
  cacheTag('events');

  const events: PublicEvent[] = await getEvents();
  const withStatus = events.map((event) => ({ ...event, ended: isPastEvent(event.date) }));

  const upcoming = withStatus.filter((event) => !event.ended);
  const locationCount = new Set(upcoming.map((event) => event.location)).size;
  const topicTags = Array.from(new Set(upcoming.flatMap((event) => event.tags ?? [])));
  const chips = ( topicTags.length >= 4 ? topicTags : DEFAULT_CHIPS).slice(0, 6);

  return (
      <section>
          <div className="hero">
            <div className="hero-chips" aria-hidden="true">
                {chips.map((tag) => (
                    <span key={tag} className="hero-chip">{tag}</span>
                ))}
            </div>

            <p className="hero-pill">
                <span className="size-2 rounded-full bg-primary motion-safe:animate-pulse" />
                Find your next dev event
            </p>

            <h1>The Hub for Every Dev <br/>  Event You Can't Miss</h1>
            <p className="hero-sub">Hackathons, Meetups, & Conferences, All in One Place </p>

            <ExploreBtn/>

            {upcoming.length > 0 && (
                <div className="hero-stats">
                    <p><strong>{upcoming.length}</strong> upcoming events </p>
                    <p><strong>{locationCount}</strong> locations </p>
                    <p><strong>{topicTags.length}</strong> topics </p>
                </div>
            )}
          </div>


        <div id="events" className="scroll-mt-20 pt-8">
          <EventsBrowser events={withStatus} />
        </div>

        {events.length === 0 && <p className="mt-20 text-center">No events yet.</p>}

        <div className="cta">
            <h3>Hosting something? Put it on the map.</h3>
            <p>Share your Hackathon, meetup or conference with the community in a couple of minutes.</p>
            <CreateEventButton label="Host an event" />
        </div>
      </section>
  )
}
export default Page