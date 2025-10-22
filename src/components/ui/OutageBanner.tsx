import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "./button";

export function OutageBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

    // Check if banner was previously dismissed (stored in localStorage)
    useEffect(() => {
        const dismissed = localStorage.getItem("awsOutageBannerDismissed");
        if (dismissed === "true") {
            setIsDismissed(true);
            setIsVisible(false);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem("awsOutageBannerDismissed", "true");
    };

    if (isDismissed || !isVisible) {
        return null;
    }

    return (
        <div className="relative w-full bg-amber-600 text-white shadow-md z-50">
            <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm sm:text-base font-medium">
                            <span className="font-bold">Service Notice:</span> Due to the AWS outage, some features may not be working. However, you can still join the webinar on{" "}
                            <a
                                href="/royal-tv"
                                className="underline font-bold hover:text-amber-100 transition-colors"
                            >
                                Royal TV
                            </a>.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDismiss}
                        className="h-8 w-8 flex-shrink-0 text-white hover:bg-amber-700 hover:text-white"
                        aria-label="Dismiss banner"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

