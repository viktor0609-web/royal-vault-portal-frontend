import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogDescription,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { FileUploadWithProgress } from "@/components/ui/file-upload-with-progress";
import { YouTubeUpload } from "@/components/ui/YouTubeUpload";
import { courseApi, imageApi, fileApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon, Trash2, X } from "lucide-react";

// Utility function for YouTube video ID extraction
const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
};

interface Lecture {
    _id: string;
    title: string;
    description: string;
    content: string;
    youtubeUrl?: string;
    youtubeVideoId?: string;
    relatedFiles?: RelatedFile[];
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

interface RelatedFile {
    name: string;
    uploadedUrl: string;
    file?: File;
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
        content: "",
        youtubeUrl: "",
        youtubeVideoId: ""
    });
    const [relatedFiles, setRelatedFiles] = useState<RelatedFile[]>([]);
    const [newRelatedFile, setNewRelatedFile] = useState({ name: "", file: null as File | null, uploadedUrl: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (editingLecture) {
            setFormData({
                title: editingLecture.title || "",
                description: editingLecture.description || "",
                content: editingLecture.content || "",
                youtubeUrl: editingLecture.youtubeUrl || "",
                youtubeVideoId: editingLecture.youtubeVideoId || ""
            });
            setRelatedFiles(editingLecture.relatedFiles || []);
        } else {
            setFormData({
                title: "",
                description: "",
                content: "",
                youtubeUrl: "",
                youtubeVideoId: ""
            });
            setRelatedFiles([]);
        }
        setNewRelatedFile({ name: "", file: null, uploadedUrl: "" });
    }, [editingLecture, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Video is completely optional - no validation required

            // Files are now uploaded immediately when selected, so we just need to prepare the data
            // Remove _id from relatedFiles as it's not needed for backend
            const cleanedRelatedFiles = relatedFiles.map(file => ({
                name: file.name,
                uploadedUrl: file.uploadedUrl || ""
            }));

            const lectureData = {
                ...formData,
                relatedFiles: cleanedRelatedFiles,
                courseId: courseId
            };

            let response;
            if (editingLecture) {
                response = await courseApi.updateLecture(editingLecture._id, lectureData);
                toast({
                    title: "Success",
                    description: "Lecture updated successfully",
                });
            } else {
                response = await courseApi.createLecture(lectureData);
                toast({
                    title: "Success",
                    description: "Lecture created successfully",
                });

                // If we have YouTube video data and this is a new lecture, save it to backend
                if (formData.youtubeUrl && formData.youtubeVideoId) {
                    try {
                        await courseApi.saveYouTubeVideo(response.data._id, {
                            youtubeUrl: formData.youtubeUrl,
                            title: formData.title,
                            description: formData.description,
                            videoId: formData.youtubeVideoId
                        });
                        console.log('✅ YouTube video data saved to backend for new lecture');
                    } catch (error) {
                        console.error('❌ Failed to save YouTube video data to backend:', error);
                        // Don't show error to user as the lecture was created successfully
                    }
                }
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
        if (field === 'youtubeUrl') {
            const youtubeVideoId = extractYouTubeVideoId(value);

            setFormData(prev => ({
                ...prev,
                [field]: value,
                youtubeVideoId: youtubeVideoId || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleAddRelatedFile = () => {
        if (newRelatedFile.uploadedUrl) {
            const newFile = {
                name: newRelatedFile.name || "",
                uploadedUrl: newRelatedFile.uploadedUrl
            };
            setRelatedFiles(prev => {
                const updated = [...prev, newFile];
                console.log('Added related file:', newFile);
                console.log('Updated related files:', updated);
                return updated;
            });
            setNewRelatedFile({ name: "", file: null, uploadedUrl: "" });
        }
    };

    const handleRemoveRelatedFile = (index: number) => {
        setRelatedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRelatedFileChange = (field: 'name', value: string) => {
        setNewRelatedFile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogTitle className="text-xl font-semibold">
                    {editingLecture ? "Edit Lecture" : "Create Lecture"}
                </DialogTitle>
                <DialogDescription>
                    {editingLecture ? "Update the lecture details and content below." : "Fill in the details to create a new lecture for this course."}
                </DialogDescription>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Section */}
                    <div>
                        <Label htmlFor="title" className="text-royal-dark-gray font-bold text-base">
                            Name
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            className="mt-2 bg-gray-50 border-gray-200 rounded-lg"
                            placeholder="What are the best practices around structuring entities with partners?"
                            required
                        />
                    </div>

                    {/* Content Section */}
                    <div>
                        <Label className="text-royal-dark-gray font-bold text-base">
                            Content
                        </Label>
                        <div className="mt-2">
                            <RichTextEditor
                                value={formData.content}
                                onChange={(value) => handleInputChange("content", value)}
                                className="bg-white rounded-lg "
                                style={{ height: '200px' }}
                                placeholder="Enter lecture content here..."
                            />
                        </div>
                    </div>

                    {/* Video Section */}
                    <div>
                        <Label className="text-royal-dark-gray font-bold text-base mp-6">
                            Video <span className="text-gray-500 font-normal">(Upload to YouTube)</span>
                        </Label>

                        <div className="mt-2">
                            <YouTubeUpload
                                onVideoUploaded={(videoId, videoUrl, title) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        youtubeVideoId: videoId,
                                        youtubeUrl: videoUrl
                                    }));
                                    toast({
                                        title: "Video uploaded to YouTube",
                                        description: `"${title}" has been uploaded successfully`,
                                    });
                                }}
                                className="w-full"
                                lectureId={editingLecture?._id} // Pass lecture ID to save video to backend
                                autoSave={!!editingLecture?._id} // Only auto-save if editing existing lecture
                            />
                        </div>
                    </div>

                    {/* Related Files Section */}
                    <div>
                        <Label className="text-royal-dark-gray font-bold text-base">
                            Related Files/Resources <span className="text-gray-500 font-normal">(Optional - Upload files only)</span>
                        </Label>
                        <div className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/3">Name (Optional)</TableHead>
                                        <TableHead className="w-1/2">Upload File</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {relatedFiles.map((file, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{file.name || "Untitled"}</TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                Uploaded File
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRemoveRelatedFile(index)}
                                                        className="h-8 px-2"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell>
                                            <Input
                                                value={newRelatedFile.name}
                                                onChange={(e) => handleRelatedFileChange("name", e.target.value)}
                                                placeholder="File name (optional)"
                                                className="border-gray-200"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FileUploadWithProgress
                                                key="related-file-upload"
                                                id="related-file-upload"
                                                onFileUploaded={(fileUrl, fileName) => {
                                                    console.log('Related file uploaded:', fileUrl, fileName);
                                                    setNewRelatedFile(prev => ({
                                                        ...prev,
                                                        name: prev.name || fileName,
                                                        uploadedUrl: fileUrl
                                                    }));
                                                }}
                                                accept="*/*"
                                                maxSize={500}
                                                className="w-full"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleAddRelatedFile}
                                                className="h-8 px-2 bg-blue-600 hover:bg-blue-700"
                                                disabled={!newRelatedFile.uploadedUrl}
                                            >
                                                <PlusIcon className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium rounded-lg"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}