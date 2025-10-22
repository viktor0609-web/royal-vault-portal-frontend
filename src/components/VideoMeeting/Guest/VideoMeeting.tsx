
import { useState } from "react";
import { BoxSelectIcon, UserIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../ui/select";
import { GuestMeeting } from "./GuestMeeting";

export const VideoMeeting = () => {

    return (
        <div className="h-dvh w-screen flex flex-col overflow-hidden @container">
            {/* Header - Responsive with mobile-first approach */}
            <header className="flex flex-col sm:flex-row justify-between bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-3 sm:mb-6 flex-shrink-0 gap-3 sm:gap-0">
                <div className="flex gap-2 sm:gap-4 items-center min-w-0">
                    <BoxSelectIcon className="h-6 w-6 sm:h-10 sm:w-10 text-royal-gray flex-shrink-0" />
                    <h1 className="text-sm sm:text-lg md:text-2xl font-bold text-royal-dark-gray uppercase truncate">
                        Mindset Mastery 10-22-25
                    </h1>
                </div>
            </header>


            {/* Main Content Area - Uses CSS Grid for modern layout */}
            <main className="flex-1 min-h-0 grid grid-rows-1 grid-cols-1 @[768px]:grid-cols-[1fr_320px] @[1024px]:grid-cols-[1fr_400px] gap-0">
                {/* Video / Room Area - Responsive container */}
                <section className="p-2 sm:p-4 flex flex-col min-h-0 @container/video">
                    <GuestMeeting />
                </section>
            </main>
        </div>
    );
}