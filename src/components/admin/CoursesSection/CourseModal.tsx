import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UnsavedChangesDialog } from "@/components/ui/unsaved-changes-dialog";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploadWithProgress } from "@/components/ui/file-upload-with-progress";
import { X } from "lucide-react";

interface CourseGroup {
  _id: string;
  title: string;
  description: string;
  icon: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  courses: any[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  courseGroup: string;
  lectures: any[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  ebookName?: string;
  ebookUrl?: string;
}

interface CourseModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  editingCourse?: Course | null;
  onCourseSaved: (courseData?: Course, isUpdate?: boolean) => void;
  courseGroupId?: string;
}

export function CourseModal({ isOpen, closeDialog, editingCourse, onCourseSaved, courseGroupId }: CourseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ebookName: "",
    ebookUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  const { toast } = useToast();

  // Track unsaved changes
  const { hasUnsavedChanges, resetChanges } = useUnsavedChanges(initialFormData, formData);

  useEffect(() => {
    if (editingCourse) {
      const initialData = {
        title: editingCourse.title || "",
        description: editingCourse.description || "",
        ebookName: editingCourse.ebookName || "",
        ebookUrl: editingCourse.ebookUrl || "",
      };
      setFormData(initialData);
      setInitialFormData(initialData);
    } else {
      const emptyData = {
        title: "",
        description: "",
        ebookName: "",
        ebookUrl: "",
      };
      setFormData(emptyData);
      setInitialFormData(emptyData);
    }
  }, [editingCourse, isOpen, courseGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // If ebookUrl is empty, also clear ebookName
      const submitData = {
        ...formData,
        ebookName: formData.ebookUrl ? formData.ebookName : "",
        ebookUrl: formData.ebookUrl || "",
      };

      let response;
      if (editingCourse) {
        response = await courseApi.updateCourse(editingCourse._id, submitData);
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        response = await courseApi.createCourse(submitData, courseGroupId || "");
        toast({
          title: "Success",
          description: "Course created successfully",
        });
      }
      resetChanges(); // Reset unsaved changes flag
      onCourseSaved(response.data, !!editingCourse);
      closeDialog();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to save course";
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

  const handleEbookUploaded = (url: string, filename: string) => {
    setFormData(prev => ({ ...prev, ebookUrl: url }));
    // If ebookName is empty, use the filename as default name
    if (!formData.ebookName) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({ ...prev, ebookUrl: url, ebookName: nameWithoutExt }));
    } else {
      setFormData(prev => ({ ...prev, ebookUrl: url }));
    }
    toast({
      title: "Success",
      description: "Ebook uploaded successfully",
    });
  };

  const handleRemoveEbook = () => {
    setFormData(prev => ({ ...prev, ebookUrl: "", ebookName: "" }));
    toast({
      title: "Ebook Removed",
      description: "Ebook has been removed. Click save to update the course.",
    });
  };

  const handleReplaceEbook = () => {
    setFormData(prev => ({ ...prev, ebookUrl: "" }));
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      if (hasUnsavedChanges) {
        setShowCloseConfirmation(true);
      } else {
        closeDialog();
      }
    }
  };

  const confirmClose = () => {
    setShowCloseConfirmation(false);
    closeDialog();
  };

  const cancelClose = () => {
    setShowCloseConfirmation(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingCourse ? "Edit Course" : "Create Course"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 min-w-0 w-full">
            <div className="w-full min-w-0">
              <Label htmlFor="title" className="text-royal-dark-gray font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="mt-1 w-full"
                required
              />
            </div>

            <div className="w-full min-w-0">
              <Label htmlFor="description" className="text-royal-dark-gray font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="mt-1 w-full"
                rows={3}
                required
              />
            </div>

            <div className="w-full min-w-0">
              <Label htmlFor="ebookName" className="text-royal-dark-gray font-medium">
                Ebook Name
              </Label>
              <Input
                id="ebookName"
                value={formData.ebookName}
                onChange={(e) => handleInputChange("ebookName", e.target.value)}
                className="mt-1 w-full"
                placeholder="Enter ebook display name (e.g., 'Complete Guide to Investing')"
              />
              <p className="text-xs text-gray-500 mt-1">
                The name that will be displayed on the ebook download button
              </p>
            </div>

            <div className="w-full min-w-0">
              <Label className="text-royal-dark-gray font-medium">
                Ebook File
              </Label>
              {formData.ebookUrl ? (
                <div className="mt-1 w-full min-w-0">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 w-full min-w-0">
                    <div className="flex items-center justify-between gap-2 w-full min-w-0">
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate w-full" title={formData.ebookUrl.split('/').pop() || 'Ebook file uploaded'}>
                          {formData.ebookUrl.split('/').pop() || 'Ebook file uploaded'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 truncate w-full" title={formData.ebookName || 'Current ebook file'}>
                          {formData.ebookName ? `Display name: ${formData.ebookName}` : 'Current ebook file'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleReplaceEbook}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 whitespace-nowrap"
                        >
                          Replace
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveEbook}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          title="Delete ebook"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <FileUploadWithProgress
                  onFileUploaded={handleEbookUploaded}
                  accept=".pdf,.epub,.mobi,.doc,.docx"
                  maxSize={100}
                  className="mt-1"
                  id="ebook-upload"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                Upload the ebook file (PDF, EPUB, MOBI, DOC, DOCX). Max size: 100MB
              </p>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
              disabled={loading}
            >
              {loading ? "Saving..." : editingCourse ? "Update" : "Create"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={showCloseConfirmation}
        onOpenChange={setShowCloseConfirmation}
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
    </>
  );
}