import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Webinar {
  title: string;
  date: string;
  time: string;
  status: string;
}

interface WebinarRegistrationModalProps {
  webinar: Webinar | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebinarRegistrationModal({ webinar, open, onOpenChange }: WebinarRegistrationModalProps) {
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState({
    days: 2,
    hours: 20,
    minutes: 22,
    seconds: 58
  });

  useEffect(() => {
    if (!open) return;

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
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registering for webinar:", webinar?.title, "with email:", email);
    onOpenChange(false);
  };

  if (!webinar) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <div 
          className="relative h-64 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center"
          style={{
            backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>')"
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative text-center text-white z-10">
            <h1 className="text-4xl font-bold mb-4">{webinar.title}</h1>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mx-4">
              <h2 className="text-2xl font-bold mb-4">REGISTER FOR THE WEBINAR</h2>
              <form onSubmit={handleSubmit}>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-4 bg-white/90 text-black placeholder:text-gray-600"
                  required
                />
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
                >
                  Yes! I Want To Reserve My Seat Now
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-6">
            Tuesday September 9th, 4:00pm
          </div>
          
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-royal-dark-gray">{countdown.days}</div>
              <div className="text-sm text-royal-gray">Days</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-royal-dark-gray">{countdown.hours}</div>
              <div className="text-sm text-royal-gray">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-royal-dark-gray">{countdown.minutes}</div>
              <div className="text-sm text-royal-gray">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-royal-dark-gray">{countdown.seconds}</div>
              <div className="text-sm text-royal-gray">Seconds</div>
            </div>
          </div>

          <div className="border-t border-royal-light-gray pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-royal-dark-gray rounded flex items-center justify-center mr-3">
                <span className="text-white font-bold">RL</span>
              </div>
              <div>
                <div className="font-bold text-royal-dark-gray">ROYAL LEGAL</div>
                <div className="font-bold text-royal-dark-gray">SOLUTIONS</div>
              </div>
            </div>
            
            <p className="text-xs text-royal-gray mb-2">
              Copyright © 2023 Royal Legal Solutions. All rights reserved.
            </p>
            
            <div className="flex justify-center gap-4 text-xs text-primary">
              <a href="#" className="hover:underline">Disclaimer</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Terms</a>
            </div>
            
            <p className="text-xs text-royal-gray mt-4 leading-relaxed">
              This website is operated and maintained by Royal Legal Solutions. Use of the website is governed by its Terms of Service and Privacy Policy.<br/>
              Royal Legal Solutions is a tax and law firm with licensed CPAs, attorneys and paralegals. We do not offer investment opportunities, provide a "get rich quick" scheme, or deal in gray or black hat tax savings tactics. We provide educational information about how tax, legal, and investing work together so that individuals can better evaluate the state of their financial situation and the quality of their providers.<br/>
              The information contained in this site is provided for informational purposes only, and should not be construed as legal advice on any subject matter. You should not act on the basis of any content included in this site without seeking professional advice. You should not act on the basis of any content included in this site without seeking professional advice. We disclaim all liability for actions you take or fail to take based on any content on this site. The operation of this site does not create an attorney-client relationship between you and Royal Legal Solutions.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}