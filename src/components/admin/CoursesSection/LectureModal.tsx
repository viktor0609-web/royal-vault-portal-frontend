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
import { courseApi, imageApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon, Trash2 } from "lucide-react";

interface Lecture {
    _id: string;
    title: string;
    description: string;
    content: string;
    videoUrl: string;
    videoFile?: string;
    pdfUrl?: string;
    relatedFiles?: RelatedFile[];
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

interface RelatedFile {
    _id?: string;
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
        videoFile: "",
        pdfUrl: ""
    });
    const [relatedFiles, setRelatedFiles] = useState<RelatedFile[]>([]);
    const [newRelatedFile, setNewRelatedFile] = useState({ name: "", url: "", file: null as File | null });
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
                videoFile: editingLecture.videoFile || "",
                pdfUrl: editingLecture.pdfUrl || ""
            });
            setRelatedFiles(editingLecture.relatedFiles || []);
        } else {
            setFormData({
                title: "",
                description: "",
                content: "",
                videoUrl: "",
                videoFile: "",
                pdfUrl: ""
            });
            setRelatedFiles([]);
        }
        setNewRelatedFile({ name: "", url: "", file: null });
        setVideoFile(null);
    }, [editingLecture, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let videoFileUrl = formData.videoFile;

            // Upload video file if a new file is selected
            if (videoFile) {
                const formData = new FormData();
                formData.append('image', videoFile);
                const response = await imageApi.uploadImage(formData);
                videoFileUrl = response.data.url;
            }

            const lectureData = {
                ...formData,
                videoFile: videoFileUrl,
                relatedFiles: relatedFiles,
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

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setFormData(prev => ({ ...prev, videoFile: file.name }));
        }
    };

    const handleAddRelatedFile = async () => {
        if (newRelatedFile.name && (newRelatedFile.url || newRelatedFile.file)) {
            let fileUrl = newRelatedFile.url;

            // Upload file if a file is selected
            if (newRelatedFile.file) {
                try {
                    const formData = new FormData();
                    formData.append('image', newRelatedFile.file);
                    const response = await imageApi.uploadImage(formData);
                    fileUrl = response.data.url;
                } catch (error) {
                    console.error('Error uploading file:', error);
                    toast({
                        title: "Error",
                        description: "Failed to upload file",
                        variant: "destructive",
                    });
                    return;
                }
            }

            setRelatedFiles(prev => [...prev, {
                ...newRelatedFile,
                _id: Date.now().toString(),
                url: fileUrl,
                uploadedUrl: fileUrl
            }]);
            setNewRelatedFile({ name: "", url: "", file: null });
        }
    };

    const handleRemoveRelatedFile = (id: string) => {
        setRelatedFiles(prev => prev.filter(file => file._id !== id));
    };

    const handleRelatedFileChange = (field: 'name' | 'url', value: string) => {
        setNewRelatedFile(prev => ({ ...prev, [field]: value }));
    };

    const handleRelatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewRelatedFile(prev => ({
                ...prev,
                file: file,
                name: file.name,
                url: "" // Clear URL when file is selected
            }));
        }
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

                    {/* URL Section */}
                    <div>
                        <Label htmlFor="videoUrl" className="text-royal-dark-gray font-bold text-base">
                            URL
                        </Label>
                        <Input
                            id="videoUrl"
                            type="url"
                            value={formData.videoUrl}
                            onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                            className="mt-2 bg-gray-50 border-gray-200 rounded-lg"
                            placeholder="https://example.com/video.mp4"
                        />
                    </div>

                    {/* Video File Section */}
                    <div>
                        <Label className="text-royal-dark-gray font-bold text-base">
                            Video File
                        </Label>
                        <div className="mt-2">
                            {formData.videoFile ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-600 text-sm">
                                    {formData.videoFile}
                                </div>
                            ) : (
                                <Input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoFileChange}
                                    className="bg-gray-50 border-gray-200 rounded-lg"
                                />
                            )}
                        </div>
                    </div>

                    {/* Related Files Section */}
                    <div>
                        <Label className="text-royal-dark-gray font-bold text-base">
                            Related Files/Resources
                        </Label>
                        <div className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/3">Name</TableHead>
                                        <TableHead className="w-1/4">URL/File</TableHead>
                                        <TableHead className="w-1/4">Upload</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {relatedFiles.map((file) => (
                                        <TableRow key={file._id}>
                                            <TableCell className="font-medium">{file.name}</TableCell>
                                            <TableCell className="text-blue-600 hover:underline">
                                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                    {file.url.length > 25 ? `${file.url.substring(0, 25)}...` : file.url}
                                                </a>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {file.uploadedUrl ? "Uploaded" : "URL"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRemoveRelatedFile(file._id!)}
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
                                                placeholder="File name"
                                                className="border-gray-200"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={newRelatedFile.url}
                                                onChange={(e) => handleRelatedFileChange("url", e.target.value)}
                                                placeholder="https://example.com/file.pdf"
                                                className="border-gray-200"
                                                disabled={!!newRelatedFile.file}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="file"
                                                onChange={handleRelatedFileUpload}
                                                className="border-gray-200 text-sm"
                                                accept="*/*"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleAddRelatedFile}
                                                className="h-8 px-2 bg-blue-600 hover:bg-blue-700"
                                                disabled={!newRelatedFile.name || (!newRelatedFile.url && !newRelatedFile.file)}
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