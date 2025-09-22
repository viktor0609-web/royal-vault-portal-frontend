import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminState } from "@/hooks/useAdminState";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ArrowLeftIcon, PlusIcon, Edit, Trash2, EyeIcon, PlayIcon } from "lucide-react";
import { LectureModal } from "./LectureModal";
import { useToast } from "@/hooks/use-toast";
import { courseApi } from "@/lib/api";

interface Lecture {
  _id: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  videoFile?: string;
  relatedFiles?: Array<{
    name: string;
    url: string;
    uploadedUrl?: string;
  }>;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  courseGroup: {
    _id: string;
    title: string;
    description: string;
    icon: string;
  };
  lectures: Lecture[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export function CourseDetail() {
  const { groupId, courseId } = useParams<{ groupId: string; courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use admin state management
  const {
    state: course,
    setState: setCourse,
    isLoading: loading,
    error,
    setError,
    getUrlParams
  } = useAdminState<Course | null>(null, `course_${courseId}`);

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  const handleAddLecture = () => {
    setEditingLecture(null);
    setIsLectureModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLectureModalOpen(false);
    setEditingLecture(null);
  };

  const handleLectureSaved = (lectureData?: Lecture, isUpdate?: boolean) => {
    if (lectureData) {
      if (isUpdate) {
        setLectures(prev =>
          prev.map(lecture => lecture._id === lectureData._id ? lectureData : lecture)
        );
      } else {
        setLectures(prev => [...prev, lectureData]);
      }
    }
  };

  const handleEdit = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setIsLectureModalOpen(true);
  };

  const handleDelete = async (lectureId: string) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await courseApi.deleteLecture(lectureId);
        fetchCourse(); // Refresh the data
        toast({
          title: "Success",
          description: "Lecture deleted successfully",
        });
      } catch (error: any) {
        console.error('Error deleting lecture:', error);
        setError(error.response?.data?.message || 'Failed to delete lecture');
        toast({
          title: "Error",
          description: error.response?.data?.message || 'Failed to delete lecture',
          variant: "destructive",
        });
      }
    }
  };

  const handleViewLecture = (lectureId: string) => {
    navigate(`/admin/courses/groups/${groupId}/courses/${courseId}/lectures/${lectureId}`);
  };

  const fetchCourse = async () => {
    if (!courseId) return;

    try {
      setError(null);
      const response = await courseApi.getCourseById(courseId);
      setCourse(response.data);
      setLectures(response.data.lectures || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch course';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg border border-royal-light-gray shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-royal-light-gray">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/admin/courses/groups/${groupId}`)}
                className="flex items-center gap-2 px-3 py-2 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded-md transition-all duration-200 group"
              >
                <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm font-medium">Back to Course Group</span>
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-royal-dark-gray">Loading Course...</h1>
          </div>
        </div>
        <div className="text-center py-8">Loading course...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg border border-royal-light-gray shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-royal-light-gray">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/admin/courses/groups/${groupId}`)}
                className="flex items-center gap-2 px-3 py-2 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded-md transition-all duration-200 group"
              >
                <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm font-medium">Back to Course Group</span>
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-royal-dark-gray">Error</h1>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Course</h3>
          <p className="text-red-600">{error || 'Course not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex flex-col">
      <div className="bg-white rounded-lg border border-royal-light-gray shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-royal-light-gray">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/admin/courses/groups/${groupId}`)}
              className="flex items-center gap-2 px-3 py-2 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded-md transition-all duration-200 group"
            >
              <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back to Course Group</span>
            </button>
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">{course.title}</h1>
              <p className="text-royal-gray mb-3">{course.description}</p>
              <div className="flex items-center gap-2 text-sm text-royal-gray">
                <span className="font-medium">Course Group:</span>
                <span className="px-2 py-1 bg-royal-light-gray rounded-md">{course.courseGroup?.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-royal-light-gray overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="text-xs text-gray-500 text-center py-2 bg-gray-50 border-b border-gray-200 sm:hidden">
          ← Scroll horizontally to see all columns →
        </div>
        <Table className="w-full min-w-[900px] text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="w-48 min-w-48">Title</TableHead>
              <TableHead className="w-64 min-w-64">Description</TableHead>
              <TableHead className="w-40 min-w-40">Video (URL/File)</TableHead>
              <TableHead className="w-32 min-w-32">Created By</TableHead>
              <TableHead className="w-32 min-w-32">Created At</TableHead>
              <TableHead className="w-32 min-w-32 text-right">
                <Button className="w-20 sm:w-24 text-xs sm:text-sm" onClick={handleAddLecture}>
                  <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Create</span>
                  <span className="sm:hidden">+</span>
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lectures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No lectures found. Create your first lecture!
                </TableCell>
              </TableRow>
            ) : (
              lectures.map((lecture) => (
                <TableRow key={lecture._id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => handleViewLecture(lecture._id)}
                      className="text-left hover:text-royal-blue transition-colors cursor-pointer"
                    >
                      {lecture.title}
                    </button>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{lecture.description}</TableCell>
                  <TableCell>
                    {lecture.videoUrl ? (
                      <a
                        href={lecture.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Video (URL)
                      </a>
                    ) : lecture.videoFile ? (
                      <a
                        href={import.meta.env.VITE_BACKEND_URL + lecture.videoFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline text-sm"
                      >
                        View Video (File)
                      </a>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>{lecture.createdBy?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {lecture.createdAt ? new Date(lecture.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="w-40 min-w-40">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(lecture)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(lecture._id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LectureModal
        isOpen={isLectureModalOpen}
        closeDialog={handleCloseModal}
        editingLecture={editingLecture}
        onLectureSaved={handleLectureSaved}
        courseId={courseId}
      />
    </div>
  );
}