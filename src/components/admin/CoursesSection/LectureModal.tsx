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
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Lecture {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    pdfUrl?: string;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

interface LectureModalProps {
    isOpen: boolean;
    closeDialog: () => void;
    editingLecture?: Lecture | null;
    onLectureSaved: (lectureData?: Lecture, isUpdate?: boolean) => void;
    courseId?: string;
}

export function LectureModal({ isOpen, closeDialog, editingLecture, onLectureSaved, courseId }: LectureModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        videoUrl: "",
        pdfUrl: ""
    });
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
        } else {
            setFormData({
                title: "",
                description: "",
                videoUrl: "",
                pdfUrl: ""
            });
        }
    }, [editingLecture, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let response;
            if (editingLecture) {
                response = await courseApi.updateLecture(editingLecture._id, formData);
                toast({
                    title: "Success",
                    description: "Lecture updated successfully",
                });
            } else {
                const lectureData = {
                    ...formData,
                    courseId: courseId
                };
                response = await courseApi.createLecture(lectureData);
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
                        <Label htmlFor="videoUrl" className="text-royal-dark-gray font-medium">
                            Video URL
                        </Label>
                        <Input
                            id="videoUrl"
                            type="url"
                            value={formData.videoUrl}
                            onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                            className="mt-1"
                            placeholder="https://example.com/video.mp4"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="pdfUrl" className="text-royal-dark-gray font-medium">
                            PDF URL (Optional)
                        </Label>
                        <Input
                            id="pdfUrl"
                            type="url"
                            value={formData.pdfUrl}
                            onChange={(e) => handleInputChange("pdfUrl", e.target.value)}
                            className="mt-1"
                            placeholder="https://example.com/document.pdf"
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