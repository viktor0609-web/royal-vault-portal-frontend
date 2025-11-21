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
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { FileUploadWithProgress } from "@/components/ui/file-upload-with-progress";
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon, Trash2 } from "lucide-react";

interface Lecture {
    _id: string;
    title: string;
    description: string;
    content: string;
    videoUrl: string;
    relatedFiles?: RelatedFile[];
    displayOnPublicPage?: boolean;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

interface RelatedFile {
    name: string;
    uploadedUrl?: string;
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
        videoUrl: "",
        displayOnPublicPage: false
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
                videoUrl: editingLecture.videoUrl || "",
                displayOnPublicPage: editingLecture.displayOnPublicPage || false
            });
            setRelatedFiles(editingLecture.relatedFiles || []);
        } else {
            setFormData({
                title: "",
                description: "",
                content: "",
                videoUrl: "",
                displayOnPublicPage: false
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
        if (newRelatedFile.uploadedUrl) {
            const newFile = {
                name: newRelatedFile.name || "",
                uploadedUrl: newRelatedFile.uploadedUrl
            };
            setRelatedFiles(prev => [...prev, newFile]);
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
        <>
            <style>{`
                .ql-editor {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif !important;
                    line-height: 1.4 !important;
                    color: #374151 !important;
                }
                
                .ql-editor * {
                    box-sizing: border-box !important;
                }
                
                .ql-editor h1 {
                    font-size: 1.875rem !important; /* 30px */
                    font-weight: 700 !important;
                    color: #1f2937 !important; /* royal-dark-gray */
                    margin-bottom: 1rem !important;
                    margin-top: 1.5rem !important;
                    line-height: 1.2 !important;
                }
                .ql-editor h2 {
                    font-size: 1.5rem !important; /* 24px */
                    font-weight: 600 !important;
                    color: #1f2937 !important; /* royal-dark-gray */
                    margin-bottom: 0.75rem !important;
                    margin-top: 1.25rem !important;
                    line-height: 1.3 !important;
                }
                .ql-editor h3 {
                    font-size: 1.25rem !important; /* 20px */
                    font-weight: 600 !important;
                    color: #1f2937 !important; /* royal-dark-gray */
                    margin-bottom: 0.5rem !important;
                    margin-top: 1rem !important;
                    line-height: 1.4 !important;
                }
                .ql-editor h4 {
                    font-size: 1.125rem !important; /* 18px */
                    font-weight: 600 !important;
                    color: #1f2937 !important; /* royal-dark-gray */
                    margin-bottom: 0.5rem !important;
                    margin-top: 0.75rem !important;
                    line-height: 1.4 !important;
                }
                .ql-editor h5 {
                    font-size: 1rem !important; /* 16px */
                    font-weight: 600 !important;
                    color: #1f2937 !important; /* royal-dark-gray */
                    margin-bottom: 0.5rem !important;
                    margin-top: 0.5rem !important;
                    line-height: 1.5 !important;
                }
                .ql-editor h6 {
                    font-size: 0.875rem !important; /* 14px */
                    font-weight: 600 !important;
                    color: #1f2937 !important; /* royal-dark-gray */
                    margin-bottom: 0.5rem !important;
                    margin-top: 0.5rem !important;
                    line-height: 1.5 !important;
                }
                .ql-editor p {
                    line-height: 1.4 !important;
                    color: #374151 !important;
                }
                .ql-editor a {
                    color: #3b82f6 !important; /* royal-blue */
                    text-decoration: none !important;
                    transition: color 0.2s ease !important;
                }
                .ql-editor a:hover {
                    text-decoration: underline !important;
                    color: #1d4ed8 !important;
                }
                .ql-editor strong, .ql-editor b {
                    font-weight: 600 !important;
                    color: #1f2937 !important; /* royal-dark-gray */
                }
                .ql-editor em, .ql-editor i {
                    font-style: italic !important;
                    color: #4b5563 !important;
                }
                .ql-editor code {
                    background-color: #f3f4f6 !important;
                    padding: 0.125rem 0.25rem !important;
                    border-radius: 0.25rem !important;
                    font-size: 0.875rem !important;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
                    color: #e11d48 !important;
                }
                .ql-editor pre {
                    background-color: #f9fafb !important;
                    border: 1px solid #e5e7eb !important;
                    border-radius: 0.5rem !important;
                    padding: 1rem !important;
                    overflow-x: auto !important;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
                    font-size: 0.875rem !important;
                    line-height: 1.5 !important;
                }
                .ql-editor pre code {
                    background: none !important;
                    padding: 0 !important;
                    color: #374151 !important;
                }
                .ql-editor blockquote {
                    border-left: 4px solid #3b82f6 !important;
                    background-color: #eff6ff !important;
                    padding: 0.75rem 1rem !important;
                    margin: 1rem 0 !important;
                    border-radius: 0 0.375rem 0.375rem 0 !important;
                    font-style: italic !important;
                }
                .ql-editor ul, .ql-editor ol {
                    margin: 0.75rem 0 !important;
                    padding-left: 1.5rem !important;
                }
                .ql-editor li {
                    margin: 0.25rem 0 !important;
                    line-height: 1.4 !important;
                }
                .ql-editor ul li {
                    list-style-type: disc !important;
                }
                .ql-editor ol li {
                    list-style-type: decimal !important;
                }
                .ql-editor table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin: 1rem 0 !important;
                    border: 1px solid #e5e7eb !important;
                    border-radius: 0.5rem !important;
                    overflow: hidden !important;
                }
                .ql-editor th, .ql-editor td {
                    padding: 0.75rem !important;
                    text-align: left !important;
                    border-bottom: 1px solid #e5e7eb !important;
                }
                .ql-editor th {
                    background-color: #f9fafb !important;
                    font-weight: 600 !important;
                    color: #1f2937 !important;
                }
                .ql-editor tr:last-child td {
                    border-bottom: none !important;
                }
                .ql-editor img {
                    max-width: 100% !important;
                    height: auto !important;
                    border-radius: 0.375rem !important;
                    margin: 0.5rem 0 !important;
                }
                .ql-editor hr {
                    border: none !important;
                    border-top: 1px solid #e5e7eb !important;
                    margin: 1.5rem 0 !important;
                }
                .ql-editor mark {
                    background-color: #fef3c7 !important;
                    padding: 0.125rem 0.25rem !important;
                    border-radius: 0.25rem !important;
                }
                .ql-editor del {
                    text-decoration: line-through !important;
                    color: #9ca3af !important;
                }
                .ql-editor ins {
                    text-decoration: underline !important;
                    color: #059669 !important;
                }
            `}</style>
            <Dialog open={isOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-1">
                    <DialogTitle className="text-xl font-semibold">
                        {editingLecture ? "Edit Lecture" : "Create Lecture"}
                    </DialogTitle>
                    <DialogDescription>
                        {editingLecture ? "Update the lecture details and content below." : "Fill in the details to create a new lecture for this course."}
                    </DialogDescription>
                    <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Title Section */}
                    <div>
                        <Label htmlFor="title" className="text-royal-dark-gray font-bold text-base">
                            Name
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            className="mt-1 bg-gray-50 border-gray-200 rounded-lg"
                            placeholder="Lecture title..."
                            required
                        />
                    </div>

                    {/* Content Section */}
                    <div>
                        <Label className="text-royal-dark-gray font-bold text-base">
                            Content
                        </Label>
                        <div className="mt-2 mb-4">
                            <RichTextEditor
                                value={formData.content}
                                onChange={(value) => handleInputChange("content", value)}
                                className="bg-white rounded-lg border border-gray-200 min-h-[200px]"
                                placeholder="Enter lecture content here..."
                            />
                        </div>
                    </div>

                    {/* Video URL Section */}
                    <div>
                        <Label htmlFor="videoUrl" className="text-royal-dark-gray font-bold text-base">
                            Video URL <span className="text-gray-500 font-normal">(Optional)</span>
                        </Label>
                        <Input
                            id="videoUrl"
                            type="url"
                            value={formData.videoUrl}
                            onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            className="mt-2"
                        />
                    </div>

                    {/* Display on Public Page Section */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="displayOnPublicPage"
                            checked={formData.displayOnPublicPage}
                            onCheckedChange={(checked) => {
                                setFormData(prev => ({ ...prev, displayOnPublicPage: checked === true }));
                            }}
                        />
                        <Label
                            htmlFor="displayOnPublicPage"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Display on public page
                        </Label>
                    </div>

                    {/* Related Files Section */}
                    <div>
                        <Label className="text-royal-dark-gray font-bold text-base">
                            Related Files/Resources <span className="text-gray-500 font-normal">(Optional - Upload files only)</span>
                        </Label>
                        <div className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
                            <Table className="min-w-full">
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
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleRemoveRelatedFile(index)}
                                                    className="h-8 px-2"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
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
        </>
    );
}
