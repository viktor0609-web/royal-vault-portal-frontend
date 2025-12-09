import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loading } from "@/components/ui/Loading";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { webinarApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Webinar } from "@/types";

export function WebinarReplayPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [webinar, setWebinar] = useState<Webinar | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWebinar = async () => {
            if (!slug) {
                toast({
                    title: "Error",
                    description: "Invalid webinar link",
                    variant: "destructive",
                });
                navigate("/royal-tv");
                return;
            }

            try {
                setLoading(true);
                const response = await webinarApi.getPublicWebinarBySlug(slug);
                const webinarData = response.data.webinar;

                if (!webinarData.recording) {
                    toast({
                        title: "Recording Not Available",
                        description: "This webinar recording is not available yet.",
                        variant: "destructive",
                    });
                    navigate("/royal-tv");
                    return;
                }

                setWebinar(webinarData);
            } catch (error: any) {
                console.error("Error fetching webinar:", error);
                toast({
                    title: "Error",
                    description: error.response?.data?.message || "Failed to load webinar recording",
                    variant: "destructive",
                });
                navigate("/royal-tv");
            } finally {
                setLoading(false);
            }
        };

        fetchWebinar();
    }, [slug, navigate, toast]);


    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <Loading message="Loading recording..." />
            </div>
        );
    }

    if (!webinar || !webinar.recording) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center text-white">
                    <p className="text-xl">Recording not available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black flex flex-col">
            {/* Header with Title */}
            <div className="bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4 z-10">
                <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-white font-bold text-lg sm:text-xl truncate">
                            {webinar.line1 || webinar.name || "Webinar Recording"}
                        </h1>
                        {webinar.line2 && (
                            <p className="text-gray-400 text-sm truncate">{webinar.line2}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Video Player - Fullscreen */}
            <div className="flex-1 w-full h-full overflow-hidden">
                <VideoPlayer
                    videoUrl={webinar.recording}
                    className="w-full h-full"
                    autoPlay={true}
                />
            </div>
        </div>
    );
}

