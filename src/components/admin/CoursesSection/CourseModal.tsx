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
import { Checkbox } from "@/components/ui/checkbox";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploadWithProgress } from "@/components/ui/file-upload-with-progress";
import { X, Plus, Link as LinkIcon, FileText, FileSpreadsheet, BookOpen, Globe } from "lucide-react";

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

interface Resource {
  name: string;
  url: string;
  type: 'ebook' | 'pdf' | 'spreadsheet' | 'url' | 'other';
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
  resources?: Resource[];
  // Legacy fields for backward compatibility
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

const resourceTypes = [
  { value: 'ebook', label: 'Ebook', icon: BookOpen },
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'spreadsheet', label: 'Spreadsheet', icon: FileSpreadsheet },
  { value: 'url', label: 'URL', icon: Globe },
  { value: 'other', label: 'Other', icon: FileText },
];

const getResourceTypeIcon = (type: string) => {
  const resourceType = resourceTypes.find(rt => rt.value === type);
  return resourceType ? resourceType.icon : FileText;
};

const getFileAcceptTypes = (type: string) => {
  switch (type) {
    case 'ebook':
      return '.pdf,.epub,.mobi,.doc,.docx';
    case 'pdf':
      return '.pdf';
    case 'spreadsheet':
      return '.xls,.xlsx,.csv,.ods';
    default:
      return '*';
  }
};

export function CourseModal({ isOpen, closeDialog, editingCourse, onCourseSaved, courseGroupId }: CourseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resources: [] as Resource[],
    displayOnPublicPage: false,
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
      // Migrate legacy ebook fields to resources if needed
      let resources: Resource[] = editingCourse.resources || [];
      
      // If no resources but has legacy ebook fields, migrate them
      if (resources.length === 0 && editingCourse.ebookName && editingCourse.ebookUrl) {
        resources = [{
          name: editingCourse.ebookName,
          url: editingCourse.ebookUrl,
          type: 'ebook'
        }];
      }

      const initialData = {
        title: editingCourse.title || "",
        description: editingCourse.description || "",
        resources,
        displayOnPublicPage: editingCourse.displayOnPublicPage || false,
      };
      setFormData(initialData);
      setInitialFormData(JSON.parse(JSON.stringify(initialData)));
    } else {
      const emptyData = {
        title: "",
        description: "",
        resources: [],
        displayOnPublicPage: false,
      };
      setFormData(emptyData);
      setInitialFormData(JSON.parse(JSON.stringify(emptyData)));
    }
  }, [editingCourse, isOpen, courseGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate resources
      for (let i = 0; i < formData.resources.length; i++) {
        const resource = formData.resources[i];
        if (!resource.name || !resource.url) {
          setError(`Resource ${i + 1} must have both name and URL`);
          setLoading(false);
          return;
        }
      }

      const submitData = {
        title: formData.title,
        description: formData.description,
        resources: formData.resources,
        displayOnPublicPage: formData.displayOnPublicPage,
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
      resetChanges();
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

  const handleResourceChange = (index: number, field: keyof Resource, value: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((resource, i) =>
        i === index ? { ...resource, [field]: value } : resource
      ),
    }));
  };

  const handleAddResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { name: "", url: "", type: "other" }],
    }));
  };

  const handleRemoveResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
    toast({
      title: "Resource Removed",
      description: "Resource has been removed. Click save to update the course.",
    });
  };

  const handleResourceUploaded = (index: number, url: string, filename: string) => {
    const resource = formData.resources[index];
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((r, i) =>
        i === index
          ? {
              ...r,
              url,
              name: r.name || nameWithoutExt,
            }
          : r
      ),
    }));
    
    toast({
      title: "Success",
      description: "Resource uploaded successfully",
    });
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
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

            {/* Resources Section */}
            <div className="w-full min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-royal-dark-gray font-semibold text-base">
                    Resources
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add ebooks, PDFs, spreadsheets, URLs, or other files
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddResource}
                  className="flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Resource</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>

              {formData.resources.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white text-center transition-all hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-white">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <FileText className="h-6 w-6 text-primary/60" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">No resources added</p>
                    <p className="text-xs text-gray-500">Click "Add Resource" to get started</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.resources.map((resource, index) => {
                    const IconComponent = getResourceTypeIcon(resource.type);
                    const isFileType = resource.type !== 'url';
                    const hasUrl = resource.url && resource.url.trim() !== '';

                    return (
                      <div 
                        key={index} 
                        className="group relative p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30"
                      >
                        {/* Header with Icon and Remove Button */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg group-hover:bg-primary/15 transition-colors">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  Resource {index + 1}
                                </span>
                                {hasUrl && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                    Ready
                                  </span>
                                )}
                              </div>
                              {resource.name && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                  {resource.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveResource(index)}
                            className="flex-shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                            title="Remove resource"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                          {/* Resource Type and Name in Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Resource Type */}
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                Type
                              </Label>
                              <Select
                                value={resource.type}
                                onValueChange={(value) => handleResourceChange(index, 'type', value)}
                              >
                                <SelectTrigger className="h-10 border-gray-200 hover:border-primary/40 transition-colors">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {resourceTypes.map((type) => {
                                    const TypeIcon = type.icon;
                                    return (
                                      <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                          <TypeIcon className="h-4 w-4" />
                                          <span>{type.label}</span>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Resource Name */}
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                Display Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                value={resource.name}
                                onChange={(e) => handleResourceChange(index, 'name', e.target.value)}
                                className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20"
                                placeholder="e.g., Complete Guide to Investing"
                                required
                              />
                            </div>
                          </div>

                          {/* Resource URL or File Upload */}
                          {isFileType ? (
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                File
                              </Label>
                              {hasUrl ? (
                                <div className="p-4 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                                        <FileText className="h-4 w-4 text-green-700" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate" title={resource.url.split('/').pop() || 'File uploaded'}>
                                          {resource.url.split('/').pop() || 'File uploaded'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                          {resource.name || 'File ready'}
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleResourceChange(index, 'url', '')}
                                      className="flex-shrink-0 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
                                    >
                                      Replace
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <FileUploadWithProgress
                                    onFileUploaded={(url, filename) => handleResourceUploaded(index, url, filename)}
                                    accept={getFileAcceptTypes(resource.type)}
                                    maxSize={100}
                                    id={`resource-upload-${index}`}
                                  />
                                  <p className="text-xs text-gray-500">
                                    Supported: {getFileAcceptTypes(resource.type).replace(/\./g, '').replace(/,/g, ', ')} • Max size: 100MB
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                URL <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                  <LinkIcon className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                  value={resource.url}
                                  onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                                  className="pl-10 h-10 border-gray-200 focus:border-primary focus:ring-primary/20"
                                  placeholder="https://example.com/resource"
                                  type="url"
                                  required
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {/* Display on Public Pages */}
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
                Display on public pages
              </Label>
            </div>

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
