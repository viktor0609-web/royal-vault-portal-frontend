import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { fileApi, webinarApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Webinar {
    _id: string;
    name?: string;
    recording?: string;
}

interface RecsModalProps {
    isOpen: boolean;
    closeDialog: () => void;
    webinar?: Webinar | null;
    onRecordingSaved?: () => void;
}

export function RecsModal({ isOpen, closeDialog, webinar, onRecordingSaved }: RecsModalProps) {
    const { toast } = useToast();
    const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [recordingUrl, setRecordingUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (webinar?.recording) {
            setRecordingUrl(webinar.recording);
        } else {
            setRecordingUrl("");
        }
        setSelectedFile(null);
    }, [webinar, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDownload = () => {
        if (webinar?.recording) {
            const link = document.createElement('a');
            link.href = webinar.recording;
            link.download = webinar.recording.split('/').pop() || 'recording';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!webinar?._id) {
            toast({
                title: "Error",
                description: "Webinar not found",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        try {
            let finalUrl = "";

            if (uploadMethod === "file") {
                if (!selectedFile) {
                    toast({
                        title: "Error",
                        description: "Please select a file to upload",
                        variant: "destructive",
                    });
                    setIsUploading(false);
                    return;
                }

                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadResponse = await fileApi.uploadFile(formData);
                finalUrl = uploadResponse.data.url;
            } else {
                // URL method
                if (!recordingUrl.trim()) {
                    toast({
                        title: "Error",
                        description: "Please enter a valid URL",
                        variant: "destructive",
                    });
                    setIsUploading(false);
                    return;
                }
                finalUrl = recordingUrl.trim();
            }

            // Update webinar with recording URL
            await webinarApi.updateWebinar(webinar._id, {
                recording: finalUrl
            });

            toast({
                title: "Success",
                description: "Recording uploaded successfully",
            });

            if (onRecordingSaved) {
                onRecordingSaved();
            }

            closeDialog();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to upload recording';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-md">
                <DialogTitle className="text-royal-dark-gray font-medium mb-4">
                    Local Recording
                </DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Download button if recording exists */}
                    {webinar?.recording && (
                        <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg border">
                            <p className="text-sm text-gray-600">Recording available</p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    )}

                    {/* Upload method selection */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={uploadMethod === "file" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setUploadMethod("file")}
                            className="flex-1"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload File
                        </Button>
                        <Button
                            type="button"
                            variant={uploadMethod === "url" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setUploadMethod("url")}
                            className="flex-1"
                        >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Use URL
                        </Button>
                    </div>

                    {/* File upload input */}
                    {uploadMethod === "file" && (
                        <div>
                            <Label htmlFor="file" className="text-royal-dark-gray font-medium">
                                Select Recording File
                            </Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={handleFileChange}
                                className="mt-1"
                                accept="video/*,audio/*,.mp4,.webm,.mkv,.mov,.avi"
                            />
                            {selectedFile && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Selected: {selectedFile.name}
                                </p>
                            )}
                        </div>
                    )}

                    {/* URL input */}
                    {uploadMethod === "url" && (
                        <div>
                            <Label htmlFor="url" className="text-royal-dark-gray font-medium">
                                Recording URL
                            </Label>
                            <Input
                                id="url"
                                type="url"
                                value={recordingUrl}
                                onChange={(e) => setRecordingUrl(e.target.value)}
                                placeholder="https://example.com/recording.mp4"
                                className="mt-1"
                            />
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDialog}
                            className="flex-1"
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-royal-blue-dark text-white"
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {uploadMethod === "file" ? "Upload" : "Save URL"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}