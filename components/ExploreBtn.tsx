'use client';
import Image from "next/image";
import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

const ExploreBtn = () => {
    const handleExploreClick = () => {
        console.log('Click');

        if (projectToken && posthogHost) {
            posthog.capture("explore_events_clicked");
            posthog.logger.info("explore_events_clicked", { source: "hero" });
        }
    };

    return (
        <div id="explore-btn" className="mt-7 mx-auto">
            <a href="#events" onClick={handleExploreClick}>
                Explore Events
                <Image src="/icons/arrow-down.svg" alt="" width={24} height={24} />
            </a>
        </div>
    )
}
export default ExploreBtn
