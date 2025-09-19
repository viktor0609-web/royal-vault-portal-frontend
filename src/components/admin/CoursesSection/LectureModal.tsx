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
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { FileUploadWithProgress } from "@/components/ui/file-upload-with-progress";
import { courseApi, imageApi, fileApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon, Trash2, X } from "lucide-react";

interface Lecture {
    _id: string;
    title: string;
    description: string;
    content: string;
    videoUrl: string;
    videoFile?: string;
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
    url: string;
    file?: File;
    uploadedUrl?: string;
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
        videoUrl: "",
        videoFile: ""
    });
    const [relatedFiles, setRelatedFiles] = useState<RelatedFile[]>([]);
    const [newRelatedFile, setNewRelatedFile] = useState({ name: "", url: "", file: null as File | null, uploadedUrl: "" });
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (editingLecture) {
            setFormData({
                title: editingLecture.title || "",
                description: editingLecture.description || "",
                content: editingLecture.content || "",
                videoUrl: editingLecture.videoUrl || "",
                videoFile: editingLecture.videoFile || ""
            });
            setRelatedFiles(editingLecture.relatedFiles || []);
        } else {
            setFormData({
                title: "",
                description: "",
                content: "",
                videoUrl: "",
                videoFile: ""
            });
            setRelatedFiles([]);
        }
        setNewRelatedFile({ name: "", url: "", file: null, uploadedUrl: "" });
        setVideoFile(null);
    }, [editingLecture, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate that at least one video option is provided (only for new lectures)
            if (!editingLecture && !formData.videoUrl && !formData.videoFile) {
                setError("Please provide either a video URL or upload a video file");
                setLoading(false);
                return;
            }

            // Files are now uploaded immediately when selected, so we just need to prepare the data
            // Remove _id from relatedFiles as it's not needed for backend
            const cleanedRelatedFiles = relatedFiles.map(file => ({
                name: file.name,
                url: file.url,
                uploadedUrl: file.uploadedUrl || ""
            }));

            const lectureData = {
                ...formData,
                relatedFiles: cleanedRelatedFiles,
                courseId: courseId
            };

            console.log('Final lecture data being sent:', lectureData);
            console.log('Related files count:', cleanedRelatedFiles.length);





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

    const handleAddRelatedFile = () => {
        if (newRelatedFile.url || newRelatedFile.uploadedUrl) {
            const fileUrl = newRelatedFile.uploadedUrl || newRelatedFile.url;
            const newFile = {
                name: newRelatedFile.name || "",
                url: fileUrl,
                uploadedUrl: newRelatedFile.uploadedUrl || ""
            };
            setRelatedFiles(prev => {
                const updated = [...prev, newFile];
                console.log('Added related file:', newFile);
                console.log('Updated related files:', updated);
                return updated;
            });
            setNewRelatedFile({ name: "", url: "", file: null, uploadedUrl: "" });
        }
    };

    const handleRemoveRelatedFile = (index: number) => {
        setRelatedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRelatedFileChange = (field: 'name' | 'url', value: string) => {
        setNewRelatedFile(prev => ({
            ...prev,
            [field]: value,
            // Clear uploadedUrl when manually entering URL
            uploadedUrl: field === 'url' ? "" : prev.uploadedUrl
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogTitle className="text-xl font-semibold">
                    {editingLecture ? "Edit Lecture" : "Create Lecture"}
                </DialogTitle>
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
                                className="bg-white rounded-lg border border-gray-200"
                                style={{ height: '200px' }}
                                placeholder="Enter lecture content here..."
                            />
                        </div>
                    </div>

                    {/* Video Section */}
                    <div>
                        <Label className="text-royal-dark-gray font-bold text-base">
                            Video <span className="text-gray-500 font-normal">(Optional - URL takes priority over file)</span>
                        </Label>

                        {/* Video URL */}
                        <div className="mt-2">
                            <Label htmlFor="videoUrl" className="text-sm text-gray-600">
                                Video URL (Priority)
                            </Label>
                            <Input
                                id="videoUrl"
                                type="url"
                                value={formData.videoUrl}
                                onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                                className="mt-1 bg-gray-50 border-gray-200 rounded-lg"
                                placeholder="https://example.com/video.mp4"
                            />
                        </div>

                        {/* OR Divider */}
                        <div className="flex items-center my-4">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="px-3 text-sm text-gray-500 bg-white">OR</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>

                        {/* Video File Upload */}
                        <div>
                            <Label className="text-sm text-gray-600">
                                Upload Video File (Fallback)
                            </Label>
                            <div className="mt-1">
                                {formData.videoFile ? (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-600 text-sm flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium">Video File Uploaded</div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {formData.videoFile.length > 50 ? `${formData.videoFile.substring(0, 50)}...` : formData.videoFile}
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFormData(prev => ({ ...prev, videoFile: "" }))}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <FileUploadWithProgress
                                        key="video-file-upload"
                                        id="video-file-upload"
                                        onFileUploaded={(fileUrl, fileName) => {
                                            console.log('Video file uploaded:', fileUrl, fileName);
                                            setFormData(prev => ({ ...prev, videoFile: fileUrl }));
                                        }}
                                        accept="video/*"
                                        maxSize={500}
                                        className="w-full"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Related Files Section */}
                    <div>
                        <Label className="text-royal-dark-gray font-bold text-base">
                            Related Files/Resources <span className="text-gray-500 font-normal">(Optional - Upload required for each item)</span>
                        </Label>
                        <div className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/3">Name (Optional)</TableHead>
                                        <TableHead className="w-1/4">Source</TableHead>
                                        <TableHead className="w-1/4">Upload/URL</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {relatedFiles.map((file, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{file.name || "Untitled"}</TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {file.uploadedUrl ? "Uploaded File" : "External URL"}
                                            </TableCell>
                                            <TableCell className="text-blue-600 hover:underline">
                                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                    {file.url.length > 25 ? `${file.url.substring(0, 25)}...` : file.url}
                                                </a>
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
                                            <div className="text-xs text-gray-500">
                                                Choose upload or URL
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                {/* Upload Option */}
                                                <div>
                                                    <FileUploadWithProgress
                                                        key="related-file-upload"
                                                        id="related-file-upload"
                                                        onFileUploaded={(fileUrl, fileName) => {
                                                            console.log('Related file uploaded:', fileUrl, fileName);
                                                            setNewRelatedFile(prev => ({
                                                                ...prev,
                                                                name: prev.name || fileName, // Only use fileName if name is empty
                                                                url: fileUrl,
                                                                uploadedUrl: fileUrl
                                                            }));
                                                        }}
                                                        accept="*/*"
                                                        maxSize={500}
                                                        className="w-full"
                                                    />
                                                </div>

                                                {/* OR Divider */}
                                                <div className="flex items-center">
                                                    <div className="flex-1 border-t border-gray-300"></div>
                                                    <span className="px-2 text-xs text-gray-500 bg-white">OR</span>
                                                    <div className="flex-1 border-t border-gray-300"></div>
                                                </div>

                                                {/* URL Option */}
                                                <div>
                                                    <Input
                                                        value={newRelatedFile.url}
                                                        onChange={(e) => handleRelatedFileChange("url", e.target.value)}
                                                        placeholder="https://example.com/file.pdf"
                                                        className="border-gray-200 text-sm"
                                                        disabled={!!newRelatedFile.uploadedUrl}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleAddRelatedFile}
                                                className="h-8 px-2 bg-blue-600 hover:bg-blue-700"
                                                disabled={!newRelatedFile.url && !newRelatedFile.uploadedUrl}
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