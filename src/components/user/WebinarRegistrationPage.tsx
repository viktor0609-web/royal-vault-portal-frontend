
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WebinarRegistrationPage() {
    const [countdown, setCountdown] = useState({
        days: 1,
        hours: 15,
        minutes: 15,
        seconds: 15
    });
    const [email, setEmail] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
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
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegistered(true);
    };

    return (
        <div className="w-full h-full">
            <div className="h-screen flex flex-col" style={{ backgroundColor: '#282a2e' }}>
                {/* Header Section */}
                <div className="text-center py-4 flex-shrink-0">
                    <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                        Office Hours with Elite Staff
                    </h1>
                </div>

                {/* Main Content Section with Background Image */}
                <div
                    className="relative flex-1 bg-no-repeat flex flex-col justify-center"
                    style={{
                        backgroundImage: "url('/imgs/webinar_register_bg.webp')",
                        backgroundPosition: 'center',
                        backgroundSize: '100% 100%'
                    }}
                >
                    {/* Content Container with Max Width */}
                    <div className="w-full max-w-6xl mx-auto px-4">
                        {/* Registration Form */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                                <h2 className="text-2xl font-bold text-center mb-6" style={{ color: '#333333', fontFamily: 'Arial, sans-serif' }}>
                                    REGISTER FOR THE WEBINAR
                                </h2>

                                {isRegistered ? (
                                    <div className="text-center">
                                        <div className="text-green-600 text-lg font-bold mb-4">✓ Registration Successful!</div>
                                        <p className="text-gray-600">Your seat has been reserved.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <Input
                                            type="email"
                                            placeholder="liz@royallegalsolutions.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full mb-4 h-12 text-lg text-center"
                                            style={{
                                                backgroundColor: '#f0f8ff',
                                                borderColor: '#d1d5db',
                                                fontFamily: 'Arial, sans-serif'
                                            }}
                                            required
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-lg font-bold text-white rounded-md"
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
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-8" style={{ color: '#f1c40f', fontFamily: 'Arial, sans-serif' }}>
                                Wednesday October 8th, 2:00am
                            </div>

                            {/* Countdown Timer */}
                            <div className="flex justify-center space-x-8">
                                <div className="text-center">
                                    <div className="text-6xl font-bold" style={{ color: '#f1c40f', fontFamily: 'Arial, sans-serif' }}>
                                        {countdown.days}
                                    </div>
                                    <div className="text-white text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        Days
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-6xl font-bold" style={{ color: '#f1c40f', fontFamily: 'Arial, sans-serif' }}>
                                        {countdown.hours}
                                    </div>
                                    <div className="text-white text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        Hours
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-6xl font-bold" style={{ color: '#f1c40f', fontFamily: 'Arial, sans-serif' }}>
                                        {countdown.minutes}
                                    </div>
                                    <div className="text-white text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        Minutes
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-6xl font-bold" style={{ color: '#f1c40f', fontFamily: 'Arial, sans-serif' }}>
                                        {countdown.seconds}
                                    </div>
                                    <div className="text-white text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        Seconds
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="py-4 flex-shrink-0" style={{ backgroundColor: '#282a2e' }}>
                    <div className="text-center">
                        {/* Logo */}
                        <div className="mb-4">
                            <img src="/imgs/logo.svg" alt="Royal Legal Solutions" className="h-12 mx-auto mb-2 filter invert" />
                            <div className="text-white text-xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                ROYAL LEGAL
                            </div>
                            <div className="text-white text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                                SOLUTIONS
                            </div>
                        </div>

                        {/* Copyright */}
                        <p className="text-white text-sm mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                            Copyright @ 2025 Royal Legal Solutions. All rights reserved.
                        </p>

                        {/* Navigation Links */}
                        <div className="flex justify-center space-x-4 mb-6">
                            <a href="#" className="text-white text-sm font-bold hover:underline" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Disclaimer
                            </a>
                            <a href="#" className="text-white text-sm font-bold hover:underline" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Privacy
                            </a>
                            <a href="#" className="text-white text-sm font-bold hover:underline" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Terms
                            </a>
                        </div>

                        {/* Legal Disclaimers */}
                        <div className="max-w-4xl mx-auto px-4 text-center">
                            <p className="text-gray-300 text-xs leading-relaxed mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                                This website is operated and maintained by Royal Legal Solutions. Use of the website is governed by its Terms of Service and Privacy Policy.
                            </p>
                            <p className="text-gray-300 text-xs leading-relaxed mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
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
