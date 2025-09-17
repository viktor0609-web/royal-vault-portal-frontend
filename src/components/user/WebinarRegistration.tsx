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
    <div className="flex flex-col w-full">
      {/* Hero / Header Section */}
      <div
        className="flex flex-col items-center justify-center h-[50dvh] min-h-[500px] bg-cover"
        style={{
          backgroundImage: "url('/imgs/registration_back.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/80" />  {/* 50% opacity black overlay */}
        <div className="flex flex-col items-center z-10 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <div className="bg-white backdrop-blur-sm rounded-lg w-[500px] p-6 mx-4 mb-3">
            {registerStatus ? '' : <h2 className="text-2xl font-bold mb-4 text-black">REGISTER FOR THE WEBINAR</h2>}
            <form onSubmit={handleSubmit}>
              {registerStatus ?
                <div className="flex gap-4 items-center">
                  <CheckIcon className="text-green-500 w-20 hidden min-[700px]:block" />
                  <h2 className="text-2xl font-bold text-black uppercase text-center">Your sit is scheduled</h2>
                </div> :
                <>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-4 mb-4 bg-white/90 text-black placeholder:text-gray-600"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
                    onClick={() => setRegisterStatus(true)}
                  >
                    Yes! I Want To Reserve My Seat Now
                  </Button>
                </>}


            </form>
          </div>

          <div className="text-3xl font-bold text-yellow-100 mb-6">
            {webinar.date}, {webinar.time}
          </div>

          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{countdown.days}</div>
              <div className="text-sm text-white">Days</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold  text-white">{countdown.hours}</div>
              <div className="text-sm text-white">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold  text-white">{countdown.minutes}</div>
              <div className="text-sm text-white">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{countdown.seconds}</div>
              <div className="text-sm text-white">Seconds</div>
            </div>
          </div>
        </div>
      </div>
      {/* Countdown & Info Section */}
      <div className="p-8 text-center flex-1 bg-gray-800 z-10">

        {/* Footer Info */}
        <div className="pt-6">
          <div className="flex flex-col items-center gap-4 mb-4">
            <img src='/imgs/logo.svg' className="w-7 filter invert brightness-0" />
            <div>
              <div className="font-bold text-white">ROYAL LEGAL</div>
              <div className="font-bold text-white">SOLUTIONS</div>
            </div>
          </div>

          <p className="text-xs text-white mb-2">
            Copyright © 2023 Royal Legal Solutions. All rights reserved.
          </p>

          <div className="flex justify-center gap-4 text-base text-white mt-4">
            <a href="#" className="hover:underline">Disclaimer</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>

          <p className="text-xs text-white mt-4 leading-relaxed max-w-5xl mx-auto">
            This website is operated and maintained by Royal Legal Solutions. Use of the website is governed by its Terms of Service and Privacy Policy.<br /><br />
            Royal Legal Solutions is a tax and law firm with licensed CPAs, attorneys and paralegals. We do not offer investment opportunities, provide a "get rich quick" scheme, or deal in gray or black hat tax savings tactics. We provide educational information about how tax, legal, and investing work together so that individuals can better evaluate the state of their financial situation and the quality of their providers.<br /><br />
            The information contained in this site is provided for informational purposes only, and should not be construed as legal advice on any subject matter. You should not act on the basis of any content included in this site without seeking professional advice. We disclaim all liability for actions you take or fail to take based on any content on this site. The operation of this site does not create an attorney-client relationship between you and Royal Legal Solutions.
          </p>
        </div>
      </div>
    </div>
  );
}
