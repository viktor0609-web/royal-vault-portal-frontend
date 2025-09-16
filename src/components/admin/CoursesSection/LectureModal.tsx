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
                response = await courseApi.createLecture({
                    ...formData,
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

                    {/* Video URL Field */}
                    <div>
                        <Label htmlFor="videoUrl" className="text-royal-dark-gray font-medium text-sm">
                            Video URL
                        </Label>
                        <Input
                            id="videoUrl"
                            value={formData.videoUrl}
                            onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                            className="mt-1 rounded-lg"
                            placeholder="https://example.com/video"
                            type="url"
                            required
                        />
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
