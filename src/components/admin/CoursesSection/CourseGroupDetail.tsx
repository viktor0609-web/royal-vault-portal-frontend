import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminState } from "@/hooks/useAdminState";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ArrowLeftIcon, PlusIcon, Edit, Trash2, EyeIcon, PlayIcon } from "lucide-react";
import { CourseModal } from "./CourseModal";
import { useToast } from "@/hooks/use-toast";
import { courseApi } from "@/lib/api";

interface Course {
    _id: string;
    title: string;
    description: string;
    courseGroup: string;
    lectures: Lecture[];
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

interface Lecture {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    displayOnPublicPage?: boolean;
}

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

export function CourseGroupDetail() {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Use admin state management
    const {
        state: courseGroup,
        setState: setCourseGroup,
        isLoading: loading,
        setIsLoading,
        error,
        setError,
        getUrlParams
    } = useAdminState<CourseGroup | null>(null, `courseGroup_${groupId}`);

    const [courses, setCourses] = useState<Course[]>([]);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const handleAddCourse = () => {
        setEditingCourse(null);
        setIsCourseModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCourseModalOpen(false);
        setEditingCourse(null);
    };

    const handleCourseSaved = (courseData?: Course, isUpdate?: boolean) => {
        if (courseData) {
            if (isUpdate) {
                setCourses(prev =>
                    prev.map(course => course._id === courseData._id ? courseData : course)
                );
            } else {
                setCourses(prev => [...prev, courseData]);
            }
        }
    };

    const handleEdit = (e: React.MouseEvent, course: Course) => {
        e.stopPropagation();
        setEditingCourse(course);
        setIsCourseModalOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, courseId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this course? This will also delete all associated lectures.')) {
            try {
                await courseApi.deleteCourse(courseId);
                fetchCourseGroup(); // Refresh the data
                toast({
                    title: "Success",
                    description: "Course deleted successfully",
                });
            } catch (error: any) {
                console.error('Error deleting course:', error);
                setError(error.response?.data?.message || 'Failed to delete course');
                toast({
                    title: "Error",
                    description: error.response?.data?.message || 'Failed to delete course',
                    variant: "destructive",
                });
            }
        }
    };

    const handleViewCourse = (courseId: string) => {
        navigate(`/admin/courses/groups/${groupId}/courses/${courseId}`);
    };

    const fetchCourseGroup = async () => {
        if (!groupId) return;

        try {
            setIsLoading(true);
            setError(null);
            // Admin should see all courses, not just public ones (publicOnly=false)
            const response = await courseApi.getCourseGroupById(groupId, 'basic', false);
            setCourseGroup(response.data);
            setCourses(response.data.courses || []);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch course group';
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
        fetchCourseGroup();
    }, [groupId]);

    if (loading) {
        return (
            <div className="flex-1 p-1 sm:p-2 lg:p-4 flex flex-col">
                <div className="flex items-center gap-2 sm:gap-4 bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-4 sm:mb-6">
                    <div className="text-2xl sm:text-4xl">🎓</div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2">Course Group</h1>
                        <p className="text-xs sm:text-base text-royal-gray">Loading course group details...</p>
                    </div>
                    <div
                        className="cursor-pointer p-1.5 sm:p-2 rounded-lg hover:bg-royal-blue/5 transition-all duration-75 hover:scale-102 flex-shrink-0"
                        onClick={() => navigate('/admin/courses')}
                        title="Back to Courses"
                    >
                        <ArrowLeftIcon className="h-4 w-4 sm:h-6 sm:w-6 text-royal-gray hover:text-royal-blue transition-colors duration-75" />
                    </div>
                </div>
                <Loading message="Loading courses..." />
            </div>
        );
    }

    if (error || !courseGroup) {
        return (
            <div className="flex-1 p-4">
                <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/courses')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-royal-dark-gray">Error</h1>
                    </div>
                </div>
                <div className="text-center py-8 text-red-500">{error || 'Course group not found'}</div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-1 sm:p-2 lg:p-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-4 bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-4 sm:mb-6">
                <div className="text-2xl sm:text-4xl">🎓</div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2 truncate">{courseGroup.title}</h1>
                    <p className="text-xs sm:text-base text-royal-gray line-clamp-2">{courseGroup.description}</p>
                </div>
                <div
                    className="cursor-pointer p-1.5 sm:p-2 rounded-lg hover:bg-royal-blue/5 transition-all duration-75 hover:scale-102 flex-shrink-0"
                    onClick={() => navigate('/admin/courses')}
                    title="Back to Courses"
                >
                    <ArrowLeftIcon className="h-4 w-4 sm:h-6 sm:w-6 text-royal-gray hover:text-royal-blue transition-colors duration-75" />
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-royal-light-gray overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <Table className="w-full min-w-[800px] text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-48 min-w-48">Title</TableHead>
                            <TableHead className="w-64 min-w-64">Description</TableHead>
                            <TableHead className="w-32 min-w-32">Lectures Count</TableHead>
                            <TableHead className="w-32 min-w-32">Created By</TableHead>
                            <TableHead className="w-32 min-w-32">Created At</TableHead>
                            <TableHead className="w-32 min-w-32 text-right">
                                <Button className="w-20 sm:w-24 text-xs sm:text-sm" onClick={handleAddCourse}>
                                    <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span>Create</span>
                                    <span className="sm:hidden">+</span>
                                </Button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loading message="Loading courses..." size="md" />
                                </TableCell>
                            </TableRow>
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No courses found. Create your first course!
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course) => (
                                <TableRow key={course._id} onClick={() => handleViewCourse(course._id)} className="cursor-pointer">
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell className="max-w-xs truncate">{course.description}</TableCell>
                                    <TableCell>{course.lectures?.length || 0}</TableCell>
                                    <TableCell>{course.createdBy?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="w-40 min-w-40">
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => handleEdit(e, course)}
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={(e) => handleDelete(e, course._id)}
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

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
                {/* Add Button for Mobile */}
                <div className="flex justify-end">
                    <Button onClick={handleAddCourse} className="flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" />
                        Create
                    </Button>
                </div>

                {loading ? (
                    <Loading message="Loading courses..." />
                ) : courses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No courses found. Create your first course!
                    </div>
                ) : (
                    courses.map((course) => (
                        <div key={course._id} className="bg-white rounded-lg border border-royal-light-gray p-3 shadow-sm">
                            <div className="flex items-start justify-between mb-2 cursor-pointer" onClick={() => handleViewCourse(course._id)}>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-royal-dark-gray text-base sm:text-lg mb-1">{course.title}</h3>
                                    <p className="text-royal-gray text-xs sm:text-sm line-clamp-2">{course.description}</p>
                                </div>
                                <div className="flex gap-1 ml-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleEdit(e, course)}
                                        className="h-7 w-7 p-0"
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleDelete(e, course._id)}
                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs sm:text-sm text-royal-gray">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                        {course.lectures?.length || 0} lectures
                                    </span>
                                    <span>{course.createdBy?.name || 'N/A'}</span>
                                </div>
                                <span className="text-xs">{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <CourseModal
                isOpen={isCourseModalOpen}
                closeDialog={handleCloseModal}
                editingCourse={editingCourse}
                onCourseSaved={handleCourseSaved}
                courseGroupId={groupId}
            />
        </div>
    );
}