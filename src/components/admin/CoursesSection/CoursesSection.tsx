import { useState, useEffect } from "react";
import { GraduationCapIcon, Edit, Trash2, Plus, FolderOpen, BookOpen, FileText, Search, X } from "lucide-react";
import { CourseModal } from "./CourseModal";
import { GroupModal } from "./GroupModal";
import { ContentModal } from "./ContentModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  courses: Course[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  url: string;
  courseGroup: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  lectures: Lecture[];
}

interface Lecture {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  pdfUrl: string;
  course: string;
  completedBy: string[];
}

interface FlatItem {
  id: string;
  type: 'group' | 'course' | 'lecture';
  title: string;
  level: number;
  parentId?: string;
  groupId?: string;
  courseId?: string;
  lectureId?: string;
}

export function CoursesSection() {
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flatData, setFlatData] = useState<FlatItem[]>([]);
  const [openIndex, setOpenIndex] = useState(-1);
  const [editingGroup, setEditingGroup] = useState<CourseGroup | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const closeModal = () => {
    setOpenIndex(-1);
    setEditingGroup(null);
    setEditingCourse(null);
    setEditingLecture(null);
    setSelectedGroupId("");
    setSelectedCourseId("");
  };

  const fetchData = async (filters?: { type?: string; search?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseApi.getAllCourseGroups(filters);
      const groups = response.data || [];
      setCourseGroups(groups);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch course data");
      setCourseGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle filter changes
  useEffect(() => {
    const filters: { type?: string; search?: string } = {};
    if (activeFilter !== 'all') {
      filters.type = activeFilter;
    }
    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }
    fetchData(filters);
  }, [activeFilter, searchQuery]);

  // Update flat data whenever courseGroups changes
  useEffect(() => {
    const flatItems: FlatItem[] = [];

    if (courseGroups && Array.isArray(courseGroups)) {
      courseGroups.forEach((group: CourseGroup) => {
        // Add course group
        flatItems.push({
          id: `group_${group._id}`,
          type: 'group',
          title: group.title || 'Untitled Group',
          level: 0,
          groupId: group._id
        });

        // Add courses under this group
        if (group.courses && Array.isArray(group.courses)) {
          group.courses.forEach((course: Course) => {
            flatItems.push({
              id: `course_${course._id}`,
              type: 'course',
              title: course.title || 'Untitled Course',
              level: 1,
              parentId: `group_${group._id}`,
              groupId: group._id,
              courseId: course._id
            });

            // Add lectures under this course
            if (course.lectures && Array.isArray(course.lectures)) {
              course.lectures.forEach((lecture: Lecture) => {
                flatItems.push({
                  id: `lecture_${lecture._id}`,
                  type: 'lecture',
                  title: lecture.title || 'Untitled Lecture',
                  level: 2,
                  parentId: `course_${course._id}`,
                  groupId: group._id,
                  courseId: course._id,
                  lectureId: lecture._id
                });
              });
            }
          });
        }
      });
    }

    setFlatData(flatItems);
  }, [courseGroups]);

  const handleCreate = (type: 'group' | 'course' | 'lecture', parentId?: string) => {
    if (type === 'group') {
      setOpenIndex(1); // Group modal
    } else if (type === 'course') {
      const groupId = parentId?.replace('group_', '') || '';
      setSelectedGroupId(groupId);
      setOpenIndex(0); // Course modal
    } else if (type === 'lecture') {
      const courseId = parentId?.replace('course_', '') || '';
      setSelectedCourseId(courseId);
      setOpenIndex(2); // Content modal
    }
  };

  const handleEdit = (item: FlatItem) => {
    if (item.type === 'group') {
      const group = courseGroups.find(g => g._id === item.groupId);
      if (group) {
        setEditingGroup(group);
        setOpenIndex(1); // Group modal
      }
    } else if (item.type === 'course') {
      const group = courseGroups.find(g => g._id === item.groupId);
      if (group) {
        const course = group.courses.find(c => c._id === item.courseId);
        if (course) {
          setEditingCourse(course);
          setSelectedGroupId(group._id);
          setOpenIndex(0); // Course modal
        }
      }
    } else if (item.type === 'lecture') {
      const group = courseGroups.find(g => g._id === item.groupId);
      if (group) {
        const course = group.courses.find(c => c._id === item.courseId);
        if (course) {
          const lecture = course.lectures.find(l => l._id === item.lectureId);
          if (lecture) {
            setEditingLecture(lecture);
            setOpenIndex(2); // Content modal
          }
        }
      }
    }
  };

  const handleDelete = async (item: FlatItem) => {
    const itemId = item.courseId || item.lectureId;
    if (!itemId) return;

    setDeletingItem(itemId);

    try {
      if (item.type === 'course' && item.courseId) {
        await courseApi.deleteCourse(item.courseId);
      } else if (item.type === 'lecture' && item.lectureId) {
        await courseApi.deleteLecture(item.lectureId);
      }

      // Refresh data after deletion
      const filters: { type?: string; search?: string } = {};
      if (activeFilter !== 'all') {
        filters.type = activeFilter;
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      await fetchData(filters);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeletingItem(null);
    }
  };

  const getIcon = (type: 'group' | 'course' | 'lecture') => {
    switch (type) {
      case 'group': return FolderOpen;
      case 'course': return BookOpen;
      case 'lecture': return FileText;
      default: return FileText;
    }
  };

  const getIndentClass = (level: number) => {
    switch (level) {
      case 0: return "ml-0";
      case 1: return "ml-6";
      case 2: return "ml-12";
      default: return "ml-0";
    }
  };

  const handleGroupSaved = (newGroup?: CourseGroup, isUpdate?: boolean) => {
    if (newGroup) {
      if (isUpdate) {
        setCourseGroups(prev => prev.map(group =>
          group._id === newGroup._id ? newGroup : group
        ));
      } else {
        setCourseGroups(prev => [...prev, newGroup]);
      }
    }
  };

  const handleCourseSaved = (courseData?: any, isUpdate?: boolean) => {
    if (courseData) {
      if (isUpdate) {
        setCourseGroups(prev => prev.map(group => {
          const courses = group.courses || [];
          const updatedCourses = courses.map(course =>
            course._id === courseData._id ? courseData : course
          );
          return { ...group, courses: updatedCourses };
        }));
      } else {
        setCourseGroups(prev => prev.map(group => {
          if (group._id === selectedGroupId) {
            const courses = group.courses || [];
            return { ...group, courses: [...courses, courseData] };
          }
          return group;
        }));
      }
    }
  };

  const handleContentSaved = (lectureData?: any, isUpdate?: boolean) => {
    if (lectureData) {
      if (isUpdate) {
        setCourseGroups(prev => prev.map(group => ({
          ...group,
          courses: (group.courses || []).map(course => ({
            ...course,
            lectures: (course.lectures || []).map(lecture =>
              lecture._id === lectureData._id ? lectureData : lecture
            )
          }))
        })));
      } else {
        setCourseGroups(prev => prev.map(group => ({
          ...group,
          courses: (group.courses || []).map(course => {
            if (course._id === selectedCourseId) {
              const lectures = course.lectures || [];
              return { ...course, lectures: [...lectures, lectureData] };
            }
            return course;
          })
        })));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="flex gap-4 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-5">
          <GraduationCapIcon className="h-10 w-10 text-royal-gray" />
          <h1 className="text-2xl font-bold text-royal-dark-gray mb-2 uppercase">Courses</h1>
        </div>
        <div className="text-center py-8">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4">
        <div className="flex gap-4 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-5">
          <GraduationCapIcon className="h-10 w-10 text-royal-gray" />
          <h1 className="text-2xl font-bold text-royal-dark-gray mb-2 uppercase">Courses</h1>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="flex gap-4 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-5">
        <GraduationCapIcon className="h-10 w-10 text-royal-gray" />
        <h1 className="text-2xl font-bold text-royal-dark-gray mb-2 uppercase">Courses</h1>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {/* Filter and Search Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="px-4 py-2"
            >
              All
            </Button>
            <Button
              variant={activeFilter === 'courses' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('courses')}
              className="px-4 py-2"
            >
              Courses
            </Button>
            <Button
              variant={activeFilter === 'bundles' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('bundles')}
              className="px-4 py-2"
            >
              Bundles
            </Button>
            <Button
              variant={activeFilter === 'content' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('content')}
              className="px-4 py-2"
            >
              Content
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses, bundles, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-green-600 text-white hover:bg-green-700 px-3 py-1 rounded-lg text-sm"
            onClick={() => handleCreate('group')}
          >
            Create Course Group
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-lg text-sm"
            onClick={() => setOpenIndex(0)}
          >
            Create Course
          </Button>
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700 px-3 py-1 rounded-lg text-sm"
            onClick={() => handleCreate('lecture')}
          >
            Create Content
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-royal-light-gray">
        {flatData.length > 0 ? (
          <div className="divide-y divide-royal-light-gray">
            {flatData.map((item) => {
              const IconComponent = getIcon(item.type);
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 ${getIndentClass(item.level)}`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-royal-gray" />
                    <div>
                      <h3 className="font-medium text-royal-dark-gray">
                        {item.title || `Untitled ${item.type}`}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.type === 'group' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreate('course', item.id)}
                        className="h-8 px-2"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                    {item.type === 'course' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreate('lecture', item.id)}
                        className="h-8 px-2"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="h-8 px-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {(item.type === 'course' || item.type === 'lecture') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item)}
                        disabled={deletingItem === (item.courseId || item.lectureId)}
                        className="h-8 px-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingItem === (item.courseId || item.lectureId) ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No course groups found. Create your first course group to get started.
          </div>
        )}
      </div>

      <CourseModal
        isOpen={openIndex === 0}
        closeDialog={closeModal}
        editingCourse={editingCourse}
        selectedGroupId={selectedGroupId}
        onCourseSaved={handleCourseSaved}
      />
      <GroupModal
        isOpen={openIndex === 1}
        closeDialog={closeModal}
        editingGroup={editingGroup}
        onGroupSaved={handleGroupSaved}
      />
      <ContentModal
        isOpen={openIndex === 2}
        closeDialog={closeModal}
        editingLecture={editingLecture}
        selectedCourseId={selectedCourseId}
        onContentSaved={handleContentSaved}
      />
    </div>
  );
}