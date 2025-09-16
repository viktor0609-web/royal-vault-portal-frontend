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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { courseApi } from "@/lib/api";

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
  duration: string;
  level: string;
  lectures: any[];
}

interface CourseModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  editingCourse?: Course | null;
  onCourseSaved: (courseData?: Course, isUpdate?: boolean) => void;
}

export function CourseModal({ isOpen, closeDialog, editingCourse, onCourseSaved }: CourseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    level: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title || "",
        description: editingCourse.description || "",
        duration: editingCourse.duration || "",
        level: editingCourse.level || ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        duration: "",
        level: ""
      });
    }
  }, [editingCourse, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      let response;
      if (editingCourse) {
        // Mock update response
        response = {
          data: {
            _id: editingCourse._id,
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            level: formData.level,
            lectures: editingCourse.lectures
          }
        };
      } else {
        // Mock create response
        response = {
          data: {
            _id: `course-${Date.now()}`,
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            level: formData.level,
            lectures: []
          }
        };
      }
      onCourseSaved(response.data, !!editingCourse);
      closeDialog();
    } catch (err: any) {
      setError("Failed to save course");
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

          <div>
            <Label htmlFor="duration" className="text-royal-dark-gray font-medium">
              Duration
            </Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              className="mt-1"
              placeholder="e.g., 2 hours, 1 hour 30 minutes"
              required
            />
          </div>

          <div>
            <Label htmlFor="level" className="text-royal-dark-gray font-medium">
              Level
            </Label>
            <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select course level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="All Levels">All Levels</SelectItem>
              </SelectContent>
            </Select>
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