import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoIcon, ArrowRightIcon, PlayIcon, EyeIcon, CheckCircleIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const filterTabs = [
  { label: "UPCOMING" },
  { label: "REPLAYS" },
  { label: "WATCHED" },
];

const webinars = {
  UPCOMING: [
    {
      title: "Office Hours with Elite CPA",
      date: "TUE 9/09",
      time: "4:00PM",
      status: "LIVE CALL",
      register: true,
    },
    {
      title: "Texas Tax Deeds for Steady Income and Long-Term Growth",
      date: "THU 9/11",
      time: "4:00PM",
      status: "LIVE CALL",
      register: false,
    },
  ],
  REPLAYS: [
    {
      title: "Office Hours with Elite Attorney",
      date: "TUE 9/16",
      time: "4:00PM",
      status: "LIVE CALL",
      watched: true
    },
    {
      title: "From Chaos to Cash Flow: Why Storage Is the Smartest Play of the Decade",
      date: "THU 9/18",
      time: "4:00PM",
      status: "LIVE CALL",
      watched: false
    },
    {
      title: "Office Hours with Elite CPA",
      date: "TUE 9/23",
      time: "4:00PM",
      status: "LIVE CALL",
      watched: false
    },],
  WATCHED: [

  ]
};

interface WebinarItem {
  title: string,
  date: string,
  time: string,
  status: string,
  register: boolean | null,
  watched: boolean | null
}

export function WebinarsSection() {
  const [fitlerIndex, setFilterIndex] = useState(0);

  const handleRegister = (webinar: WebinarItem) => {
    // Open registration in new tab
    if (fitlerIndex == 0) {
      if (webinar.register) {

      } else {
        window.open(`https://royal-vault-nu.vercel.app/registration?title=${webinar.title}`, '_blank');
      }
    } else if (fitlerIndex == 1) {

    } else {

    }
  };
  const changeFilter = (index: number) => {
    setFilterIndex(index);
  }

  return (
    <div className="flex-1 p-3 min-[700px]:p-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 min-[700px]:gap-4 bg-white p-4 min-[700px]:p-6 rounded-lg border border-royal-light-gray mb-1">
        <VideoIcon className="h-12 w-12 text-royal-gray hidden min-[700px]:block" />
        <div>
          <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">WEBINARS</h1>
          <p className="text-royal-gray">
            Register for upcoming live webinars or watch replays.
          </p>
        </div>
      </div>

      <div className="flex flex-col min-[700px]:flex-row gap-3 items-center min-[700px]:items-center bg-white p-4 min-[700px]:p-6 rounded-lg border border-royal-light-gray mb-2">
        <p className="text-royal-gray hidden min-[700px]:block">Filter by:</p>
        <div className="flex gap-1 min-[700px]:gap-2 justify-center w-full min-[700px]:w-auto">
          {filterTabs.map((tab, index) => (
            <Button
              key={index}
              variant={index == fitlerIndex ? "default" : "outline"}
              size="sm"
              className={`text-xs min-[700px]:text-sm px-2 min-[700px]:px-4 py-1 min-[700px]:py-2 ${index == fitlerIndex
                ? "bg-primary hover:bg-royal-blue-dark text-white"
                : "border-royal-light-gray text-royal-gray hover:bg-royal-light-gray"
                }`}
              onClick={() => changeFilter(index)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {webinars[filterTabs[fitlerIndex].label].map((webinar, index) => (
          <div key={index} className="flex items-center justify-between p-4 min-[700px]:p-6 bg-sidebar rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow">
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
            {webinar.watched ? '' :
              <>
                {/* Desktop Button */}
                <Button
                  onClick={() => handleRegister(webinar)}
                  className="hidden min-[700px]:flex bg-primary hover:bg-royal-blue-dark text-white px-8"
                >
                  {fitlerIndex == 0 ? (webinar.register ? 'Join' : 'Register') : 'Re-watch'}
                </Button>

                {/* Mobile Action Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleRegister(webinar)}
                        className="min-[700px]:hidden bg-primary hover:bg-royal-blue-dark text-white p-2 rounded-full"
                      >
                        {fitlerIndex === 0 ? (
                          webinar.register ? <PlayIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />
                        ) : fitlerIndex === 1 ? (
                          <PlayIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
                      {fitlerIndex === 0 ? (
                        webinar.register ? 'Join Live Webinar' : 'Register for Webinar'
                      ) : fitlerIndex === 1 ? (
                        'Watch Replay'
                      ) : (
                        'View Details'
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>}

          </div>
        ))}
      </div>
    </div>
  );
}