import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";
import { WebinarRegistrationModal } from "./WebinarRegistrationModal";

const filterTabs = [
  { label: "UPCOMING", active: true },
  { label: "REPLAYS", active: false },
  { label: "WATCHED", active: false },
];

const webinars = [
  {
    title: "Office Hours with Elite CPA",
    date: "TUE 9/09",
    time: "4:00PM",
    status: "LIVE CALL",
  },
  {
    title: "Texas Tax Deeds for Steady Income and Long-Term Growth",
    date: "THU 9/11",
    time: "4:00PM",
    status: "LIVE CALL",
  },
  {
    title: "Office Hours with Elite Attorney",
    date: "TUE 9/16",
    time: "4:00PM",
    status: "LIVE CALL",
  },
  {
    title: "From Chaos to Cash Flow: Why Storage Is the Smartest Play of the Decade",
    date: "THU 9/18",
    time: "4:00PM",
    status: "LIVE CALL",
  },
  {
    title: "Office Hours with Elite CPA",
    date: "TUE 9/23",
    time: "4:00PM",
    status: "LIVE CALL",
  },
  {
    title: "How to Get Started in Apartment Investing—and Play the Wealth Game Differently",
    date: "THU 9/25",
    time: "4:00PM",  
    status: "LIVE CALL",
  },
  {
    title: "Office Hours with Elite Staff",
    date: "TUE 9/30",
    time: "4:00PM",
    status: "LIVE CALL",
  },
];

export function WebinarsSection() {
  const [selectedWebinar, setSelectedWebinar] = useState<typeof webinars[0] | null>(null);

  const handleRegister = (webinar: typeof webinars[0]) => {
    setSelectedWebinar(webinar);
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <VideoIcon className="h-12 w-12 text-royal-gray" />
          <div>
            <h1 className="text-3xl font-bold text-royal-dark-gray mb-2">WEBINARS</h1>
            <p className="text-royal-gray">
              Register for upcoming live webinars or watch replays.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-royal-gray mb-4">Filter by:</p>
          <div className="flex gap-2">
            {filterTabs.map((tab, index) => (
              <Button
                key={index}
                variant={tab.active ? "default" : "outline"}
                className={tab.active 
                  ? "bg-primary hover:bg-royal-blue-dark text-white" 
                  : "border-royal-light-gray text-royal-gray hover:bg-royal-light-gray"
                }
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {webinars.map((webinar, index) => (
            <div key={index} className="flex items-center justify-between p-6 bg-white rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow">
              <div>
                <h3 className="text-lg font-semibold text-royal-dark-gray mb-2">
                  {webinar.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-royal-gray">
                  <span>{webinar.date} @ {webinar.time}</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                    {webinar.status}
                  </span>
                </div>
              </div>
              <Button 
                onClick={() => handleRegister(webinar)}
                className="bg-primary hover:bg-royal-blue-dark text-white px-8"
              >
                Register
              </Button>
            </div>
          ))}
        </div>
      </div>

      <WebinarRegistrationModal
        webinar={selectedWebinar}
        open={!!selectedWebinar}
        onOpenChange={(open) => !open && setSelectedWebinar(null)}
      />
    </div>
  );
}