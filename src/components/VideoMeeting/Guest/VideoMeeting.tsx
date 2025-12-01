
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GuestMeeting } from "./GuestMeeting";
import { webinarApi } from "@/lib/api";
import { useDailyMeeting } from "@/context/DailyMeetingContext";

import type { Webinar } from "@/types";

// Use a subset of Webinar for video meeting
type WebinarForMeeting = Pick<Webinar, '_id' | 'name' | 'slug' | 'line1' | 'line2' | 'line3' | 'date' | 'streamType' | 'status'>;

export const VideoMeeting = () => {
    const { slug } = useParams<{ slug: string }>();
    const [webinar, setWebinar] = useState<WebinarForMeeting | null>(null);
    const [loading, setLoading] = useState(true);
    const { webinarStatus, setWebinarStatus } = useDailyMeeting();

    useEffect(() => {
        const fetchWebinar = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                const response = await webinarApi.getPublicWebinarBySlug(slug);
                setWebinar(response.data.webinar);
                setWebinarStatus(response.data.webinar.status);
            } catch (error) {
                console.error("Error fetching webinar:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWebinar();
    }, [slug]);

    return (
        <div className="h-dvh w-screen flex flex-col overflow-hidden @container">
            {/* Header - Responsive with mobile-first approach */}
            <header className="flex flex-col sm:flex-row justify-between bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-3 sm:mb-6 flex-shrink-0 gap-3 sm:gap-0">
                <div className="flex gap-2 md:gap-4 items-center min-w-0">
                    <img src='/imgs/logo.svg' className=" w-5 sm:w-6 md:w-8" />
                    <h1 className="text-sm sm:text-lg md:text-2xl font-bold text-royal-dark-gray uppercase truncate">
                        {loading ? "Loading..." : (
                            <>
                                {webinar?.name || "Webinar"}
                            </>
                        )}
                    </h1>
                </div>
            </header>


            {/* Main Content Area - Uses CSS Grid for modern layout */}
            <main className="flex-1 min-h-0 grid grid-rows-1 grid-cols-1 @[768px]:grid-cols-[1fr_320px] @[1024px]:grid-cols-[1fr_400px] gap-0">
                {/* Video / Room Area - Responsive container */}
                <section className="p-2 sm:p-4 flex flex-col min-h-0 @container/video">
                    <GuestMeeting webinarId={webinar?._id} webinarStatus={webinarStatus} />
                </section>
            </main>
        </div>
    );
}