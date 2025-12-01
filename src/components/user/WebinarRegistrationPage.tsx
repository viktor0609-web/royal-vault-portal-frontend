
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { webinarApi } from "@/lib/api";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useAuthDialog } from "@/context/AuthDialogContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { register } from "module";
import { log } from "console";

export function WebinarRegistrationPage() {
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [email, setEmail] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);
    const [webinar, setWebinar] = useState(null);
    const [formattedDate, setFormattedDate] = useState("");
    const { user } = useAuth();
    const { openDialog } = useAuthDialog();
    const navigate = useNavigate();

    const params = new URLSearchParams(new URL(window.location.href).search);
    const webinarId = params.get('id');
    const isUser = params.get('is_user');


    useEffect(() => {
        const fetchWebinar = async () => {
            const response = await webinarApi.getPublicWebinarById(webinarId, 'basic');
            setWebinar(response.data?.webinar);
            console.log('response', response.data?.webinar);
            setFormattedDate(format(new Date(response.data?.webinar.date), "EEEE MMMM do, h:mma"));
        };
        fetchWebinar();
    }, []);

    useEffect(() => {
        const checkRegistration = async () => {
            const response = await webinarApi.getWebinarAttendees(webinarId);
            setIsRegistered(response.data.attendees.some(attendee => attendee.user === user?._id));

        };
        checkRegistration();
    }, [webinar, user]);


    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const eventDate = new Date(webinar?.date);
            const diff = eventDate.getTime() - now.getTime();

            if (diff <= 0) {
                clearInterval(interval);
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                console.log(isRegistered, diff);

                if (isRegistered && user.role === 'user') {
                    navigate(`/royal-tv/${webinar?.slug}/user`);
                }

                else if (isRegistered && isUser === 'true') {
                    navigate(`/royal-tv/${webinar?.slug}/user`);
                }

                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setCountdown({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [webinar?.date, isRegistered]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            try {
                await webinarApi.registerForWebinar(webinarId, email);
                setIsRegistered(true);
                toast({
                    title: "Success!",
                    description: "You have successfully registered for the webinar",
                });
            } catch (error) {
                console.log(error);
                toast({
                    title: "Error",
                    description: error.response?.data?.message || "Failed to register for the webinar",
                    variant: "destructive",
                });
            }

        } else {
            const result = await webinarApi.isValidEmailAddress(email);
            if (result.data.exist) {
                openDialog("login")
            }
            else {
                openDialog('signup')
            }
        }
    };

    return (
        <div className="w-full min-h-screen" style={{ backgroundColor: '#282a2e' }}>
            <div className="min-h-screen flex flex-col">
                {/* Header Section */}
                <div className="text-center py-4 sm:py-6 md:py-8 flex-shrink-0">
                    {/* Wealth Brief & Investor Roundtable */}
                    <div className="text-lg sm:text-xl md:text-2xl font-medium mb-2" style={{ color: '#dbf7ff', fontFamily: 'Arial, sans-serif' }}>
                        {webinar?.line2}
                    </div>

                    {/* Main Title - LIVE Investing Coaching Session */}
                    <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-4xl font-bold text-white px-4 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {webinar?.line1}
                    </h1>

                    {/* Subtitle */}
                    <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium" style={{ color: '#dbf7ff', fontFamily: 'Arial, sans-serif' }}>
                        {webinar?.line3}
                    </div>
                </div>

                {/* Main Content Section with Background Image */}
                <div
                    className="relative flex-1 bg-no-repeat flex flex-col justify-center min-h-[60vh]"
                    style={{
                        backgroundImage: "url('/imgs/webinar_register_bg.webp')",
                        backgroundPosition: 'center',
                        backgroundSize: '100% 100%'
                    }}
                >
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    {/* Content Container with Max Width */}
                    <div className="relative z-10 w-full max-w-6xl mx-auto px-2 sm:px-4">
                        {/* Registration Form */}
                        <div className="flex justify-center mb-4 sm:mb-8">
                            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-md w-full mx-2">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-4 sm:mb-6" style={{ color: '#333333', fontFamily: 'Arial, sans-serif' }}>
                                    REGISTER FOR THE WEBINAR
                                </h2>

                                {isRegistered ? (
                                    <div className="text-center">
                                        <div className="text-green-600 text-sm sm:text-base md:text-lg font-bold mb-4">✓ Registration Successful!</div>
                                        <p className="text-gray-600 text-sm sm:text-base">Your seat has been reserved.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        {!user &&

                                            <Input
                                                type="email"
                                                placeholder="name@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full mb-3 sm:mb-4 h-10 sm:h-12 text-sm sm:text-base md:text-lg text-center"
                                                style={{
                                                    backgroundColor: '#f0f8ff',
                                                    borderColor: '#d1d5db',
                                                    fontFamily: 'Arial, sans-serif'
                                                }}
                                                required
                                            />
                                        }

                                        <Button
                                            type="submit"
                                            className="w-full h-10 sm:h-12 text-xs sm:text-sm md:text-base font-bold text-white rounded-md"
                                            style={{
                                                backgroundColor: '#3498db',
                                                fontFamily: 'Arial, sans-serif'
                                            }}
                                        >
                                            Yes! I Want To Reserve My Seat Now
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Webinar Date and Time */}
                        <div className="text-center px-4">
                            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 md:mb-8" style={{ color: '#f1c40f', fontFamily: 'Arial, sans-serif' }}>
                                {formattedDate}
                            </div>

                            {/* Countdown Timer */}
                            <div className="flex justify-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8">
                                <div className="text-center">
                                    <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        {countdown.days}
                                    </div>
                                    <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        Days
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        {countdown.hours}
                                    </div>
                                    <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        Hours
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        {countdown.minutes}
                                    </div>
                                    <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        Minutes
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        {countdown.seconds}
                                    </div>
                                    <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        Seconds
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="py-2 sm:py-4 flex-shrink-0" style={{ backgroundColor: '#282a2e' }}>
                    <div className="text-center px-4">
                        {/* Logo */}
                        <div className="mb-2 sm:mb-4">
                            <img src="https://0d88b5ddee68dce2495b6ffe5bae4d92.cdn.bubble.io/cdn-cgi/image/w=128,h=76,f=auto,dpr=1,fit=contain/f1737898584978x223029051240563500/RLS%20Shield%20Logo.png" alt="Royal Legal Solutions" className="h-8 sm:h-14 md:h-18 mx-auto mb-1 sm:mb-2" />
                        </div>

                        {/* Copyright */}
                        <p className="text-white text-xs sm:text-sm mb-2 sm:mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                            Copyright @ 2025 Royal Legal Solutions. All rights reserved.
                        </p>

                        {/* Navigation Links */}
                        <div className="flex justify-center space-x-2 sm:space-x-4 mb-3 sm:mb-6">
                            <a href="#" className="text-white text-xs sm:text-sm font-bold hover:underline" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Disclaimer
                            </a>
                            <a href="#" className="text-white text-xs sm:text-sm font-bold hover:underline" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Privacy
                            </a>
                            <a href="#" className="text-white text-xs sm:text-sm font-bold hover:underline" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Terms
                            </a>
                        </div>

                        {/* Legal Disclaimers */}
                        <div className="max-w-4xl mx-auto text-center">
                            <p className="text-gray-300 text-xs leading-relaxed mb-2 sm:mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                                This website is operated and maintained by Royal Legal Solutions. Use of the website is governed by its Terms of Service and Privacy Policy.
                            </p>
                            <p className="text-gray-300 text-xs leading-relaxed mb-2 sm:mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Royal Legal Solutions is a tax and law firm with licensed CPAs, attorneys, and paralegals. We do not offer investment opportunities, provide a "get rich quick" scheme, or deal in gray or black hat tax savings tactics. We provide educational information about how tax, legal, and investing work together so that individuals can better evaluate the state of their financial situation and the quality of their providers.
                            </p>
                            <p className="text-gray-300 text-xs leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
                                The information contained in this site is provided for informational purposes only, and should not be construed as legal advice on any subject matter. You should not act on the basis of any content included in this site without seeking professional advice. We disclaim all liability for actions you take or fail to take based on any content on this site. The operation of this site does not create an attorney-client relationship between you and Royal Legal Solutions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
