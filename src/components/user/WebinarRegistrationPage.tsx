import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { webinarApi } from '@/lib/api';

interface WebinarRegistrationPageProps { }

export function WebinarRegistrationPage({ }: WebinarRegistrationPageProps) {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const [webinar, setWebinar] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [email, setEmail] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Get webinar data from URL params
    const webinarId = searchParams.get('id');
    const webinarTitle = searchParams.get('title');
    const webinarDate = searchParams.get('date');

    useEffect(() => {
        const fetchWebinar = async () => {
            if (webinarId) {
                try {
                    const response = await webinarApi.getPublicWebinarById(webinarId);
                    setWebinar(response.data.webinar);
                } catch (error) {
                    console.error('Error fetching webinar:', error);
                    toast({
                        title: "Error",
                        description: "Failed to load webinar details",
                        variant: "destructive",
                    });
                }
            }
            setLoading(false);
        };

        fetchWebinar();
    }, [webinarId, toast]);

    // Countdown timer
    useEffect(() => {
        if (!webinar?.date) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const webinarTime = new Date(webinar.date).getTime();
            const difference = webinarTime - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [webinar?.date]);

    const handleRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !webinarId) return;

        setSubmitting(true);
        try {
            await webinarApi.registerForWebinar(webinarId);
            setRegistrationSuccess(true);
            setEmail('');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to register for webinar",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-sm sm:text-xl">Loading webinar details...</div>
            </div>
        );
    }

    return (
        <div className="w-screen min-h-screen bg-gray-900 relative overflow-hidden">
            {/* Background Image Section */}
            <div className="absolute inset-0 z-0">
                <div
                    className="w-full h-2/3 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('/imgs/webinar_register_bg.webp')`
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col min-h-screen w-full">
                {/* Header */}
                <div className="text-center pt-6 sm:pt-8 md:pt-16 pb-3 sm:pb-4 md:pb-8 px-3 sm:px-4">
                    <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-8 leading-tight">
                        Office Hours with Elite Staff
                    </h1>
                </div>

                {/* Registration Form */}
                <div className="flex justify-center px-3 sm:px-4 mb-3 sm:mb-4 md:mb-8">
                    <div className="bg-white rounded-lg shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 w-full max-w-sm sm:max-w-md">
                        {registrationSuccess ? (
                            <div className="text-center">
                                <div className="mb-3 sm:mb-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-green-600 mb-2">
                                        Registration Successful!
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                        You have successfully registered for the webinar. We'll send you a confirmation email shortly.
                                    </p>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                                        <p className="text-xs sm:text-sm text-blue-800">
                                            <strong>Next Steps:</strong><br />
                                            • Check your email for confirmation<br />
                                            • Add the event to your calendar<br />
                                            • Join 10 minutes before the start time
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setRegistrationSuccess(false)}
                                        className="w-full h-8 sm:h-10 bg-gray-600 hover:bg-gray-700 text-white font-bold text-xs sm:text-sm rounded-lg"
                                    >
                                        Register Another Email
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4 md:mb-6 text-center">
                                    REGISTER FOR THE WEBINAR
                                </h2>
                                <form onSubmit={handleRegistration} className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <div>
                                        <Input
                                            type="email"
                                            placeholder="liz@royallegalsolutions.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full h-8 sm:h-10 text-xs sm:text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-8 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-lg"
                                    >
                                        {submitting ? 'Registering...' : 'Yes! I Want To Reserve My Seat Now'}
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {/* Countdown Timer */}
                <div
                    className="text-center mb-8 md:mb-16 w-full px-4 py-4 sm:py-6"
                >
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-yellow-100 mb-4 md:mb-8">
                        Wednesday October 8th, 2:00am
                    </div>
                    <div className="flex justify-center space-x-2 sm:space-x-4 md:space-x-8">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2">
                                {timeLeft.days.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs sm:text-sm text-white">Days</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2">
                                {timeLeft.hours.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs sm:text-sm text-white">Hours</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2">
                                {timeLeft.minutes.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs sm:text-sm text-white">Minutes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2">
                                {timeLeft.seconds.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs sm:text-sm text-white">Seconds</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="w-full bg-gray-800 text-white py-6 md:py-12 px-2 md:px-4 mt-auto">
                    <div className="w-full text-center">
                        {/* Logo */}
                        <div className="mb-3 md:mb-6 flex items-center justify-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center mr-2 sm:mr-3">
                                <span className="text-gray-800 font-bold text-lg sm:text-xl">W</span>
                            </div>
                            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">ROYAL LEGAL SOLUTIONS</div>
                        </div>

                        {/* Copyright */}
                        <div className="text-xs sm:text-sm text-gray-300 mb-3 md:mb-6">
                            Copyright © 2025 Royal Legal Solutions. All rights reserved.
                        </div>

                        {/* Legal Links */}
                        <div className="flex justify-center space-x-3 md:space-x-6 mb-3 md:mb-6">
                            <a href="#" className="text-blue-400 hover:text-blue-300 underline text-xs sm:text-sm">Disclaimer</a>
                            <a href="#" className="text-blue-400 hover:text-blue-300 underline text-xs sm:text-sm">Privacy</a>
                            <a href="#" className="text-blue-400 hover:text-blue-300 underline text-xs sm:text-sm">Terms</a>
                        </div>

                        {/* Legal Disclaimers */}
                        <div className="text-xs text-gray-400 w-full space-y-2 md:space-y-3">
                            <p>
                                Royal Legal Solutions is a tax and law firm with licensed CPAs, attorneys, and paralegals.
                                We do not offer investment opportunities, "get rich quick" schemes, or "gray or black hat tax savings tactics."
                                Our services are designed to provide educational information and legal guidance to help you make informed decisions about your financial future.
                            </p>
                            <p>
                                The information provided on this website is for informational purposes only and does not constitute legal advice.
                                No attorney-client relationship is created by viewing this website or registering for our webinars.
                                Please consult with a qualified attorney for specific legal advice regarding your situation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
