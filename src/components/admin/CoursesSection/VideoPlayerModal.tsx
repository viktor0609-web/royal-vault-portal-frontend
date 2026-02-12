import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlayIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
    title?: string;
}

export function VideoPlayerModal({ isOpen, onClose, videoUrl, title }: VideoPlayerModalProps) {
    const hasUrl = Boolean(videoUrl?.trim());

    // Check if the URL is a YouTube video
    const isYouTube = hasUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));

    // Extract YouTube video ID for embedding
    const getYouTubeVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const youtubeVideoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;
    const embedUrl = youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
                        <PlayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        {title || 'Video Player'}
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    {!hasUrl ? (
                        <p className="text-muted-foreground text-sm py-4">No video URL available.</p>
                    ) : (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        {isYouTube && embedUrl ? (
                            // YouTube embed
                            <iframe
                                src={embedUrl}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={title || 'Video'}
                            />
                        ) : (
                            // Direct video file
                            <video
                                src={videoUrl}
                                className="w-full h-full object-cover"
                                controls
                                preload="metadata"
                                autoPlay={false}
                                muted={false}
                            />
                        )}
                    </div>
                    )}
                </div>
                <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
