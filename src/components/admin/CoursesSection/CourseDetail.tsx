import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  videoUrl: string;
  pdfUrl?: string;
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

  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fetchCourse = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await courseApi.getCourseById(courseId);
      setCourse(response.data);
      setLectures(response.data.lectures || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch course');
      toast({
        title: "Error",
        description: err.response?.data?.message || 'Failed to fetch course',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/courses/group/${groupId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-royal-dark-gray">Loading...</h1>
          </div>
        </div>
        <div className="text-center py-8">Loading course...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex-1 p-4">
        <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/courses/group/${groupId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-royal-dark-gray">Error</h1>
          </div>
        </div>
        <div className="text-center py-8 text-red-500">{error || 'Course not found'}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex flex-col">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/courses/group/${groupId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-royal-dark-gray uppercase">{course.title}</h1>
            <p className="text-royal-gray">{course.description}</p>
            <p className="text-sm text-gray-500">Course Group: {course.courseGroup?.title}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-royal-light-gray overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-64">Title</TableHead>
              <TableHead className="w-96">Description</TableHead>
              <TableHead className="w-48">Video URL</TableHead>
              <TableHead className="w-48">PDF URL</TableHead>
              <TableHead className="w-48">Created By</TableHead>
              <TableHead className="w-32">Created At</TableHead>
              <TableHead className="sticky right-0 bg-white z-10">
                <Button className="w-24" onClick={handleAddLecture}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lectures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No lectures found. Create your first lecture!
                </TableCell>
              </TableRow>
            ) : (
              lectures.map((lecture) => (
                <TableRow key={lecture._id}>
                  <TableCell className="font-medium">{lecture.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{lecture.description}</TableCell>
                  <TableCell>
                    {lecture.videoUrl ? (
                      <a
                        href={lecture.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Video
                      </a>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {lecture.pdfUrl ? (
                      <a
                        href={lecture.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View PDF
                      </a>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>{lecture.createdBy?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {lecture.createdAt ? new Date(lecture.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="sticky right-0 bg-white z-10">
                    <div className="flex gap-2">
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