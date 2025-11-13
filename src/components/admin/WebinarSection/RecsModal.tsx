import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Link as LinkIcon, Loader2, File, X } from "lucide-react";
import { webinarApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ProgressBar } from "@/components/ui/progress-bar";

interface Webinar {
    _id: string;
    name?: string;
    recording?: string;
    rawRecordingId?: string;
}

interface RecsModalProps {
    isOpen: boolean;
    closeDialog: () => void;
    webinar?: Webinar | null;
    onRecordingSaved?: () => void;
}

export function RecsModal({ isOpen, closeDialog, webinar, onRecordingSaved }: RecsModalProps) {
    const { toast } = useToast();
    const { uploadFile: uploadFileToSupabase, isUploading: isFileUploading } = useFileUpload();
    const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [recordingUrl, setRecordingUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (webinar?.recording) {
            setRecordingUrl(webinar.recording);
        } else {
            setRecordingUrl("");
        }
        setSelectedFile(null);
        setIsDragging(false);
    }, [webinar, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            // Check if it's a video or audio file
            if (file.type.startsWith('video/') || file.type.startsWith('audio/') ||
                /\.(mp4|webm|mkv|mov|avi|mp3|wav|m4a)$/i.test(file.name)) {
                setSelectedFile(file);
            } else {
                toast({
                    title: "Invalid file type",
                    description: "Please upload a video or audio file",
                    variant: "destructive",
                });
            }
        }
    };

    const handleDropZoneClick = () => {
        fileInputRef.current?.click();
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDownload = async () => {
        if (webinar?.rawRecordingId) {
            const response = await webinarApi.getDownloadLink(webinar.rawRecordingId);
            const downloadUrl = response.data.downloadUrl;
            window.open(downloadUrl, '_blank');
            return;



            // const link = document.createElement('a');
            // link.href = webinar.recording;
            // link.download = webinar.recording.split('/').pop() || 'recording';
            // link.target = '_blank';
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
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

                // Use new signed URL upload method
                setUploadProgress(0);
                const uploadResponse = await uploadFileToSupabase(selectedFile, (progress) => {
                    setUploadProgress(progress.percentage);
                });
                finalUrl = uploadResponse.url;
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
            setUploadProgress(0);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Local Recording</DialogTitle>
                    <DialogDescription>
                        Upload a recording file or provide a URL to the recording.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Download section if recording exists */}
                    {webinar?.rawRecordingId && (
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Download className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Recording Available</p>
                                    <p className="text-xs text-muted-foreground">Click to download the recording file</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDownload}
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    )}

                    {/* Tabs for upload method */}
                    <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "file" | "url")}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="file" className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Upload File
                            </TabsTrigger>
                            <TabsTrigger value="url" className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" />
                                Use URL
                            </TabsTrigger>
                        </TabsList>

                        {/* File upload tab content */}
                        <TabsContent value="file" className="space-y-4 mt-4">
                            <div
                                ref={dropZoneRef}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={handleDropZoneClick}
                                className={`
                                    relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                                    transition-colors
                                    ${isDragging
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                                    }
                                `}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="video/*,audio/*,.mp4,.webm,.mkv,.mov,.avi"
                                    className="hidden"
                                />

                                {selectedFile ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                            <File className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">{selectedFile.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile();
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Video or audio files (MP4, WebM, MKV, MOV, AVI, etc.)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Upload Progress Bar */}
                            {isUploading && uploadMethod === "file" && uploadProgress > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Uploading file...</Label>
                                    <ProgressBar progress={uploadProgress} size="md" />
                                </div>
                            )}
                        </TabsContent>

                        {/* URL tab content */}
                        <TabsContent value="url" className="space-y-2 mt-4">
                            <Label htmlFor="url">Recording URL</Label>
                            <Input
                                id="url"
                                type="url"
                                value={recordingUrl}
                                onChange={(e) => setRecordingUrl(e.target.value)}
                                placeholder="https://example.com/recording.mp4"
                            />
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDialog}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
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
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}