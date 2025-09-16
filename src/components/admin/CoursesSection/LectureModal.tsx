import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Lecture {
    _id: string;
    title: string;
    description: string;
    duration: string;
    videoUrl?: string;
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
        duration: "",
        videoUrl: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editingLecture) {
            setFormData({
                title: editingLecture.title || "",
                description: editingLecture.description || "",
                duration: editingLecture.duration || "",
                videoUrl: editingLecture.videoUrl || ""
            });
        } else {
            setFormData({
                title: "",
                description: "",
                duration: "",
                videoUrl: ""
            });
        }
    }, [editingLecture, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            let response;
            if (editingLecture) {
                // Mock update response
                response = {
                    data: {
                        _id: editingLecture._id,
                        title: formData.title,
                        description: formData.description,
                        duration: formData.duration,
                        videoUrl: formData.videoUrl || undefined,
                        order: editingLecture.order
                    }
                };
            } else {
                // Mock create response
                response = {
                    data: {
                        _id: `lecture-${Date.now()}`,
                        title: formData.title,
                        description: formData.description,
                        duration: formData.duration,
                        videoUrl: formData.videoUrl || undefined,
                        order: 1 // This would be calculated based on existing lectures
                    }
                };
            }
            onLectureSaved(response.data, !!editingLecture);
            closeDialog();
        } catch (err: any) {
            setError("Failed to save lecture");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogTitle className="text-xl font-semibold">
                    {editingLecture ? "Edit Lecture" : "Create Lecture"}
                </DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title" className="text-royal-dark-gray font-medium">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            className="mt-1"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description" className="text-royal-dark-gray font-medium">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className="mt-1"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="duration" className="text-royal-dark-gray font-medium">
                            Duration
                        </Label>
                        <Input
                            id="duration"
                            value={formData.duration}
                            onChange={(e) => handleInputChange("duration", e.target.value)}
                            className="mt-1"
                            placeholder="e.g., 15 minutes, 1 hour 30 minutes"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="videoUrl" className="text-royal-dark-gray font-medium">
                            Video URL (Optional)
                        </Label>
                        <Input
                            id="videoUrl"
                            value={formData.videoUrl}
                            onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                            className="mt-1"
                            placeholder="https://example.com/video"
                            type="url"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : editingLecture ? "Update" : "Create"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
