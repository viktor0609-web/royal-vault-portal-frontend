import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";

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
    <div className="flex-1 p-4">
      <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-1">
        <VideoIcon className="h-12 w-12 text-royal-gray" />
        <div>
          <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">WEBINARS</h1>
          <p className="text-royal-gray">
            Register for upcoming live webinars or watch replays.
          </p>
        </div>
      </div>

      <div className="flex gap-3 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-2">
        <p className="text-royal-gray">Filter by:</p>
        <div className="flex gap-2">
          {filterTabs.map((tab, index) => (
            <Button
              key={index}
              variant={index == fitlerIndex ? "default" : "outline"}
              className={index == fitlerIndex
                ? "bg-primary hover:bg-royal-blue-dark text-white"
                : "border-royal-light-gray text-royal-gray hover:bg-royal-light-gray"
              }
              onClick={() => changeFilter(index)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {webinars[filterTabs[fitlerIndex].label].map((webinar, index) => (
          <div key={index} className="flex items-center justify-between p-6 bg-sidebar rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow">
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
              <Button
                onClick={() => handleRegister(webinar)}
                className="bg-primary hover:bg-royal-blue-dark text-white px-8"
              >
                {fitlerIndex == 0 ? (webinar.register ? 'Join' : 'Register') : 'Re-watch'}
              </Button>}

          </div>
        ))}
      </div>
    </div>
  );
}