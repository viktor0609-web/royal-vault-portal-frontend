import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminState } from "@/hooks/useAdminState";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeftIcon, PlusIcon, Edit, Trash2, PlayIcon } from "lucide-react";
import { LectureModal } from "./LectureModal";
import { VideoPlayerModal } from "./VideoPlayerModal";
import { useToast } from "@/hooks/use-toast";
import { courseApi } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Lecture {
  _id: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  relatedFiles?: Array<{
    name: string;
    url: string;
    uploadedUrl?: string;
  }>;
  displayOnPublicPage?: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
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
  resources?: Resource[];
  // Legacy fields for backward compatibility
  ebookName?: string;
  ebookUrl?: string;
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
    setIsLoading,
    error,
    setError,
    getUrlParams
  } = useAdminState<Course | null>(null, `course_${courseId}`);

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");

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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<string | null>(null);

  const handleDelete = (lectureId: string) => {
    setLectureToDelete(lectureId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!lectureToDelete) return;

    try {
      await courseApi.deleteLecture(lectureToDelete);
      fetchCourse(); // Refresh the data
      toast({
        title: "Success",
        description: "Lecture deleted successfully",
      });
      setDeleteDialogOpen(false);
      setLectureToDelete(null);
    } catch (error: any) {
      console.error('Error deleting lecture:', error);
      setError(error.response?.data?.message || 'Failed to delete lecture');
      setDeleteDialogOpen(false);
      setLectureToDelete(null);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to delete lecture',
        variant: "destructive",
      });
    }
  }
};

const handleToggleDisplay = async (lecture: Lecture) => {
  try {
    const newDisplayValue = !lecture.displayOnPublicPage;
    await courseApi.updateLecture(lecture._id, { displayOnPublicPage: newDisplayValue });
    setLectures(prev =>
      prev.map(l => l._id === lecture._id ? { ...l, displayOnPublicPage: newDisplayValue } : l)
    );
    toast({
      title: "Success",
      description: `Lecture ${newDisplayValue ? 'enabled' : 'disabled'} for public pages`,
    });
  } catch (error: any) {
    console.error('Error updating display option:', error);
    toast({
      title: "Error",
      description: error.response?.data?.message || 'Failed to update display option',
      variant: "destructive",
    });
  }
};

const handleViewVideo = (videoUrl: string, title: string) => {
  setSelectedVideoUrl(videoUrl);
  setSelectedVideoTitle(title);
  setIsVideoModalOpen(true);
};

const handleCloseVideoModal = () => {
  setIsVideoModalOpen(false);
  setSelectedVideoUrl("");
  setSelectedVideoTitle("");
};


const fetchCourse = async () => {
  if (!courseId) return;

  try {
    setIsLoading(true);
    setError(null);
    const response = await courseApi.getCourseById(courseId, 'full', false);
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
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchCourse();
}, [courseId]);

if (loading) {
  return (
    <div className="flex-1 p-1 sm:p-2 lg:p-4 flex flex-col">
      <div className="flex items-center gap-2 sm:gap-4 bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-4 sm:mb-6">
        <div className="text-2xl sm:text-4xl">📚</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2">Course</h1>
          <p className="text-xs sm:text-base text-royal-gray">Loading course details...</p>
        </div>
        <div
          className="cursor-pointer p-1.5 sm:p-2 rounded-lg hover:bg-royal-blue/5 transition-all duration-75 hover:scale-102 flex-shrink-0"
          onClick={() => navigate(`/admin/courses/groups/${groupId}`)}
          title="Back to Course Group"
        >
          <ArrowLeftIcon className="h-4 w-4 sm:h-6 sm:w-6 text-royal-gray hover:text-royal-blue transition-colors duration-75" />
        </div>
      </div>
      <Loading message="Loading lectures..." />
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
  <div className="flex-1 p-2 sm:p-4 flex flex-col animate-in fade-in duration-100 min-w-0 max-w-full overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
    <div className="sticky top-[41px] z-30 bg-white rounded-lg border border-royal-light-gray shadow-sm mb-3 sm:mb-6 min-w-0">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-royal-light-gray">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate(`/admin/courses/groups/${groupId}`)}
            className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded transition-all duration-200 group text-xs sm:text-sm flex-shrink-0"
          >
            <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium hidden sm:inline">Back to Course Group</span>
            <span className="font-medium sm:hidden">Back</span>
          </button>
        </div>
      </div>
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-start justify-between min-w-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-royal-dark-gray mb-2 truncate">{course.title}</h1>
            <p className="text-royal-gray mb-3 text-xs sm:text-sm lg:text-base line-clamp-2">{course.description}</p>
          </div>
        </div>
      </div>
    </div>

    {error && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    )}

    {/* Desktop Table View */}
    <div className="hidden lg:block bg-white rounded-lg border border-royal-light-gray overflow-hidden flex flex-col flex-1 min-h-0 mt-4">
      <div className="overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1 min-h-0">
        <Table className="w-full text-sm">
          <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow className="border-b">
              <TableHead className="w-48 min-w-48 py-2 px-2">Title</TableHead>
              <TableHead className="w-64 min-w-64 hidden xl:table-cell py-2 px-2">Description</TableHead>
              <TableHead className="w-40 min-w-40 hidden xl:table-cell py-2 px-2">Video</TableHead>
              <TableHead className="w-32 min-w-32 py-2 px-2">Display</TableHead>
              <TableHead className="w-32 min-w-32 hidden 2xl:table-cell py-2 px-2">Created By</TableHead>
              <TableHead className="w-32 min-w-32 hidden 2xl:table-cell py-2 px-2">Created At</TableHead>
              <TableHead className="w-32 min-w-32 text-right py-2 px-2">
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
                <TableCell colSpan={7} className="text-center py-8">
                  No lectures found. Create your first lecture!
                </TableCell>
              </TableRow>
            ) : (
              lectures.map((lecture) => (
                <TableRow key={lecture._id}>
                  <TableCell className="font-medium">
                    {lecture.title}
                  </TableCell>
                  <TableCell className="max-w-xs truncate hidden xl:table-cell">{lecture.description}</TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {lecture.videoUrl ? (
                      <button
                        onClick={() => handleViewVideo(lecture.videoUrl, lecture.title)}
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <PlayIcon className="h-3 w-3" />
                        View Video
                      </button>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={lecture.displayOnPublicPage || false}
                        onCheckedChange={() => handleToggleDisplay(lecture)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm text-gray-600 hidden xl:inline">
                        {lecture.displayOnPublicPage ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden 2xl:table-cell">{lecture.createdBy?.name || 'N/A'}</TableCell>
                  <TableCell className="hidden 2xl:table-cell">
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
    </div>

    {/* Mobile/Tablet Card View */}
    <div className="lg:hidden space-y-3 sm:space-y-4 min-w-0 max-w-full overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
      {/* Add Button for Mobile */}
      <div className="flex justify-end">
        <Button onClick={handleAddLecture} className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
          <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Create</span>
        </Button>
      </div>

      {lectures.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No lectures found. Create your first lecture!
        </div>
      ) : (
        lectures.map((lecture) => (
          <div key={lecture._id} className="bg-white rounded-lg border border-royal-light-gray p-3 shadow-sm min-w-0">
            <div className="flex items-start justify-between mb-2 min-w-0">
              <div className="flex-1 min-w-0 mr-2">
                <h3 className="font-semibold text-royal-dark-gray text-sm sm:text-base mb-1 line-clamp-2">
                  {lecture.title}
                </h3>
                <p className="text-royal-gray text-xs sm:text-sm line-clamp-2">{lecture.description}</p>
              </div>
              <div className="flex gap-1 ml-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(lecture)}
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                  title="Edit"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(lecture._id)}
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-red-600 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm text-royal-gray mb-2 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 flex-wrap">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  {lecture.videoUrl ? (
                    <button
                      onClick={() => handleViewVideo(lecture.videoUrl, lecture.title)}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>Video</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1">
                      <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      No Video
                    </span>
                  )}
                </span>
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <Checkbox
                    checked={lecture.displayOnPublicPage || false}
                    onCheckedChange={() => handleToggleDisplay(lecture)}
                  />
                  <span className="text-xs">
                    {lecture.displayOnPublicPage ? 'Public' : 'Private'}
                  </span>
                </div>
                <span className="hidden sm:inline truncate">{lecture.createdBy?.name || 'N/A'}</span>
              </div>
              <span className="text-xs flex-shrink-0">{lecture.createdAt ? new Date(lecture.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        ))
      )}
    </div>

    <LectureModal
      isOpen={isLectureModalOpen}
      closeDialog={handleCloseModal}
      editingLecture={editingLecture}
      onLectureSaved={handleLectureSaved}
      courseId={courseId}
    />

    <VideoPlayerModal
      isOpen={isVideoModalOpen}
      onClose={handleCloseVideoModal}
      videoUrl={selectedVideoUrl}
      title={selectedVideoTitle}
    />

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Lecture</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this lecture? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            setDeleteDialogOpen(false);
            setLectureToDelete(null);
          }}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
);
}