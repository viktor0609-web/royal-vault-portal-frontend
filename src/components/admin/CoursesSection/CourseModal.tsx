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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title || "",
        description: editingCourse.description || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
      });
    }
  }, [editingCourse, isOpen, courseGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (editingCourse) {
        response = await courseApi.updateCourse(editingCourse._id, formData);
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        response = await courseApi.createCourse(formData, courseGroupId || "");
        toast({
          title: "Success",
          description: "Course created successfully",
        });
      }
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

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-xl font-semibold">
          {editingCourse ? "Edit Course" : "Create Course"}
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
  );
}