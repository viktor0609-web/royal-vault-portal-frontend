import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Lecture {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    pdfUrl?: string;
    order: number;
}

interface LectureModalProps {
    isOpen: boolean;
    closeDialog: () => void;
    editingLecture?: Lecture | null;
    onLectureSaved: (lectureData?: Lecture, isUpdate?: boolean) => void;
    courseId: string;
}

export function LectureModal({ isOpen, closeDialog, editingLecture, onLectureSaved, courseId }: LectureModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        videoUrl: "",
        pdfUrl: ""
    });
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (editingLecture) {
            setFormData({
                title: editingLecture.title || "",
                description: editingLecture.description || "",
                videoUrl: editingLecture.videoUrl || "",
                pdfUrl: editingLecture.pdfUrl || ""
            });
            setVideoFile(null);
        } else {
            setFormData({
                title: "",
                description: "",
                videoUrl: "",
                pdfUrl: ""
            });
            setVideoFile(null);
        }
    }, [editingLecture, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let response;
            let lectureData = { ...formData };

            // Handle video file upload if present
            if (videoFile) {
                const formData = new FormData();
                formData.append('image', videoFile);

                try {
                    const uploadResponse = await courseApi.uploadImage(formData);
                    lectureData.videoUrl = uploadResponse.data.url;
                } catch (uploadErr: any) {
                    toast({
                        title: "Upload Error",
                        description: "Failed to upload video file. Using URL instead.",
                        variant: "destructive",
                    });
                }
            }

            if (editingLecture) {
                response = await courseApi.updateLecture(editingLecture._id, lectureData);
                toast({
                    title: "Success",
                    description: "Lecture updated successfully",
                });
            } else {
                response = await courseApi.createLecture({
                    ...lectureData,
                    courseId: courseId
                });
                toast({
                    title: "Success",
                    description: "Lecture created successfully",
                });
            }
            onLectureSaved(response.data, !!editingLecture);
            closeDialog();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to save lecture";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setVideoFile(file);
        // Clear videoUrl when file is selected
        if (file) {
            setFormData(prev => ({ ...prev, videoUrl: "" }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogTitle className="text-xl font-semibold">
                    {editingLecture ? "Edit Lecture" : "Create Lecture"}
                </DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Field */}
                    <div>
                        <Label htmlFor="title" className="text-royal-dark-gray font-medium text-sm">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            className="mt-1 rounded-lg"
                            placeholder="Enter lecture title"
                            required
                        />
                    </div>

                    {/* Description Field */}
                    <div>
                        <Label htmlFor="description" className="text-royal-dark-gray font-medium text-sm">
                            Description
                        </Label>
                        <div className="mt-1">
                            <RichTextEditor
                                value={formData.description}
                                onChange={(value) => handleInputChange("description", value)}
                                placeholder="Enter lecture description..."
                            />
                        </div>
                    </div>

                    {/* Video Field - File Upload or URL */}
                    <div>
                        <Label className="text-royal-dark-gray font-medium text-sm">
                            Video Content
                        </Label>
                        <div className="mt-1 space-y-3">
                            {/* File Upload Option */}
                            <div>
                                <Label htmlFor="videoFile" className="text-royal-dark-gray font-medium text-xs">
                                    Upload Video File
                                </Label>
                                <div className="mt-1">
                                    <Input
                                        id="videoFile"
                                        type="file"
                                        accept="video/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('videoFile')?.click()}
                                        className="w-full justify-center"
                                    >
                                        Choose Video File
                                    </Button>
                                </div>
                                {videoFile && (
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-sm text-royal-gray">
                                            Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setVideoFile(null)}
                                            className="text-xs"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* OR Divider */}
                            <div className="flex items-center">
                                <div className="flex-1 border-t border-gray-300"></div>
                                <span className="px-3 text-sm text-gray-500">OR</span>
                                <div className="flex-1 border-t border-gray-300"></div>
                            </div>

                            {/* URL Option */}
                            <div>
                                <Label htmlFor="videoUrl" className="text-royal-dark-gray font-medium text-xs">
                                    Video URL
                                </Label>
                                <Input
                                    id="videoUrl"
                                    value={formData.videoUrl}
                                    onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                                    className="mt-1 rounded-lg"
                                    placeholder="https://example.com/video"
                                    type="url"
                                    disabled={!!videoFile}
                                />
                            </div>
                        </div>
                    </div>

                    {/* PDF URL Field */}
                    <div>
                        <Label htmlFor="pdfUrl" className="text-royal-dark-gray font-medium text-sm">
                            PDF URL (Optional)
                        </Label>
                        <Input
                            id="pdfUrl"
                            value={formData.pdfUrl}
                            onChange={(e) => handleInputChange("pdfUrl", e.target.value)}
                            className="mt-1 rounded-lg"
                            placeholder="https://example.com/document.pdf"
                            type="url"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    {/* Create Button */}
                    <div className="flex justify-start">
                        <Button
                            type="submit"
                            className="bg-royal-blue hover:bg-royal-blue/90 text-white px-6 py-2 rounded-lg font-medium"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : editingLecture ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
