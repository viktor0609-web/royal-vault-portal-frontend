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
import { courseApi } from "@/lib/api";

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
  url: string;
  lectures: any[];
}

interface CourseModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  editingCourse?: Course | null;
  selectedGroupId?: string;
  onCourseSaved: (courseData?: any, isUpdate?: boolean) => void;
}

export function CourseModal({ isOpen, closeDialog, editingCourse, selectedGroupId, onCourseSaved }: CourseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    groupId: ""
  });
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCourseGroups();
      if (editingCourse) {
        setFormData({
          title: editingCourse.title || "",
          description: editingCourse.description || "",
          url: editingCourse.url || "",
          groupId: selectedGroupId || ""
        });
      } else {
        setFormData({
          title: "",
          description: "",
          url: "",
          groupId: selectedGroupId || ""
        });
      }
    }
  }, [isOpen, editingCourse, selectedGroupId]);

  const fetchCourseGroups = async () => {
    setGroupsLoading(true);
    try {
      const response = await courseApi.getAllCourseGroups();
      setCourseGroups(response.data);
    } catch (err) {
      console.error("Failed to fetch course groups:", err);
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (editingCourse) {
        response = await courseApi.updateCourse(editingCourse._id, {
          title: formData.title,
          description: formData.description,
          url: formData.url
        });
      } else {
        response = await courseApi.createCourse({
          title: formData.title,
          description: formData.description,
          url: formData.url,
          courseGroupId: formData.groupId
        });
      }
      onCourseSaved(response.data, !!editingCourse);
      closeDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save course");
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
          {!editingCourse && (
            <div>
              <Label htmlFor="groupId" className="text-royal-dark-gray font-medium">
                Course Group
              </Label>
              <Select value={formData.groupId} onValueChange={(value) => handleInputChange("groupId", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a course group" />
                </SelectTrigger>
                <SelectContent>
                  {groupsLoading ? (
                    <SelectItem value="loading" disabled>Loading groups...</SelectItem>
                  ) : (
                    courseGroups.map((group) => (
                      <SelectItem key={group._id} value={group._id}>
                        {group.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

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
            <Label htmlFor="url" className="text-royal-dark-gray font-medium">
              URL
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              className="mt-1"
              placeholder="https://example.com/course"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
            disabled={loading || (!editingCourse && !formData.groupId)}
          >
            {loading ? "Saving..." : editingCourse ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}