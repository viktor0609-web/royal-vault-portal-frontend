import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { courseApi } from "@/lib/api";

interface CourseGroup {
  _id: string;
  title: string;
  description: string;
  icon: string;
  createdBy: string;
  courses: Course[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  url: string;
  lectures: Lecture[];
}

interface Lecture {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  completedBy: string[];
}

interface ContentModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  editingLecture?: Lecture | null;
  selectedCourseId?: string;
  onContentSaved: (lectureData?: any, isUpdate?: boolean) => void;
}

export function ContentModal({ isOpen, closeDialog, editingLecture, selectedCourseId, onContentSaved }: ContentModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    courseId: ""
  });
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCourseGroups();
      if (editingLecture) {
        setFormData({
          title: editingLecture.title || "",
          description: editingLecture.description || "",
          videoUrl: editingLecture.videoUrl || "",
          courseId: selectedCourseId || ""
        });
      } else {
        setFormData({
          title: "",
          description: "",
          videoUrl: "",
          courseId: selectedCourseId || ""
        });
      }
    }
  }, [isOpen, editingLecture, selectedCourseId]);

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
      if (editingLecture) {
        response = await courseApi.updateLecture(editingLecture._id, {
          title: formData.title,
          description: formData.description,
          videoUrl: formData.videoUrl
        });
      } else {
        response = await courseApi.createLecture({
          title: formData.title,
          description: formData.description,
          videoUrl: formData.videoUrl,
          courseId: formData.courseId
        });
      }
      onContentSaved(response.data, !!editingLecture);
      closeDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save lecture");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get all courses from all groups for the dropdown
  const allCourses = courseGroups.flatMap(group =>
    group.courses.map(course => ({
      ...course,
      groupTitle: group.title
    }))
  );

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-xl font-semibold">
          {editingLecture ? "Edit Lecture" : "Create Lecture"}
        </DialogTitle>
        <DialogDescription>
          {editingLecture ? "Update the lecture details below." : "Fill in the details to create a new lecture."}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingLecture && (
            <div>
              <Label htmlFor="courseId" className="text-royal-dark-gray font-medium">
                Course
              </Label>
              <Select value={formData.courseId} onValueChange={(value) => handleInputChange("courseId", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {groupsLoading ? (
                    <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                  ) : (
                    allCourses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.groupTitle} - {course.title}
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
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              className="bg-white rounded-lg shadow-none mt-1"
              style={{ height: '150px' }}
            />
          </div>

          <div className="pt-8">
            <Label htmlFor="videoUrl" className="mt-2 text-royal-dark-gray font-medium">
              Video URL
            </Label>
            <Input
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => handleInputChange("videoUrl", e.target.value)}
              className="mt-1"
              placeholder="https://example.com/video.mp4"
              required
            />
          </div>


          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
            disabled={loading || (!editingLecture && !formData.courseId)}
          >
            {loading ? "Saving..." : editingLecture ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}