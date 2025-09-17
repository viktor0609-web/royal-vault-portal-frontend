import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, useParams } from "react-router-dom";
import { CheckIcon } from "lucide-react";

interface Webinar {
  title: string;
  date: string;
  time: string;
  status: string;
}

interface WebinarRegistrationProps {
  webinar: Webinar | null;
}

export function WebinarRegistration({ webinar }: WebinarRegistrationProps) {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState({
    days: 2,
    hours: 20,
    minutes: 22,
    seconds: 58
  });
  const [registerStatus, setRegisterStatus] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const title = queryParams.get("title"); // e.g. ?userId=123



  useEffect(() => {
    if (!webinar) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [webinar]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registering for webinar:", webinar?.title, "with email:", email);
  };

  if (!webinar) return <div className="p-8 text-center">No webinar selected.</div>;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Top Section - Dark Gray Background */}
      <div className="bg-gray-900 text-center py-2 px-1">
        <p className="text-gray-400 text-xs mb-1">Wealth Brief & Investor Roundtable</p>
        <h1 className="text-xs font-bold text-white leading-tight px-1">
          From Chaos to Cash Flow: Why Storage Is the Smartest Play of the Decade
        </h1>
      </div>

      {/* Registration Form Section - White Card */}
      <div className="bg-gray-900 flex justify-center py-2 px-1">
        <div className="bg-white rounded-lg p-2 w-full max-w-xs shadow-lg">
          <h2 className="text-xs font-bold text-black text-center mb-2">REGISTER FOR THE WEBINAR</h2>
          <form onSubmit={handleSubmit}>
            {registerStatus ? (
              <div className="flex gap-1 items-center justify-center">
                <CheckIcon className="text-green-500 w-3 h-3" />
                <h2 className="text-xs font-bold text-black uppercase text-center">Your seat is scheduled</h2>
              </div>
            ) : (
              <>
                <Input
                  type="email"
                  placeholder="liz@royallegalsolutions.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-2 bg-blue-50 border-blue-200 text-black placeholder:text-blue-400 rounded-md h-6 text-xs"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 text-xs font-bold rounded-md"
                  onClick={() => setRegisterStatus(true)}
                >
                  Yes! I Want To Reserve My Seat Now
                </Button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Event Details & Countdown Section - Golden Gradient with Background */}
      <div
        className="relative text-center py-3 px-1"
        style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        }}
      >
        <div className="text-xs font-bold text-yellow-100 mb-2">
          Friday September 19th, 2:00am
        </div>

        <div className="flex justify-center gap-2 mb-1">
          <div className="text-center">
            <div className="text-sm font-bold text-blue-200">{countdown.days}</div>
            <div className="text-xs text-white">Days</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-blue-200">{countdown.hours}</div>
            <div className="text-xs text-white">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-blue-200">{countdown.minutes}</div>
            <div className="text-xs text-white">Minutes</div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-blue-200">{countdown.seconds}</div>
          <div className="text-xs text-white">Seconds</div>
        </div>
      </div>

      {/* Footer Section - Dark Gray Background */}
      <div className="bg-gray-900 text-center py-2 px-1">
        <div className="flex flex-col items-center gap-1 mb-1">
          <img src='/imgs/logo.svg' className="w-3 filter invert brightness-0" />
          <div>
            <div className="font-bold text-white text-xs">ROYAL LEGAL</div>
          </div>
        </div>

        <p className="text-xs text-white mb-1">
          Copyright © 2025 Royal Legal Solutions. All rights reserved.
        </p>

        <div className="flex justify-center gap-2 text-xs text-white">
          <a href="#" className="hover:underline">Disclaimer</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </div>
    </div>
  );
}
