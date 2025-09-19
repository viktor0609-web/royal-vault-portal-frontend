import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ArrowLeftIcon, PlusIcon, Edit, Trash2, EyeIcon, PlayIcon } from "lucide-react";
import { CourseModal } from "./CourseModal";
import { useToast } from "@/hooks/use-toast";
import { courseApi } from "@/lib/api";

interface Course {
    _id: string;
    title: string;
    description: string;
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
    pdfUrl?: string;
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
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [courseGroup, setCourseGroup] = useState<CourseGroup | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setIsCourseModalOpen(true);
    };

    const handleDelete = async (courseId: string) => {
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
        navigate(`/admin/courses/group/${id}/course/${courseId}`);
    };

    const fetchCourseGroup = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const response = await courseApi.getCourseGroupById(id);
            setCourseGroup(response.data);
            setCourses(response.data.courses || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch course group');
            toast({
                title: "Error",
                description: err.response?.data?.message || 'Failed to fetch course group',
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseGroup();
    }, [id]);

    if (loading) {
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
                        <h1 className="text-2xl font-bold text-royal-dark-gray">Loading...</h1>
                    </div>
                </div>
                <div className="text-center py-8">Loading course group...</div>
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
        <div className="flex-1 p-4 flex flex-col">
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
                <div className="flex items-center gap-4">
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
                        <h1 className="text-2xl font-bold text-royal-dark-gray uppercase">{courseGroup.title}</h1>
                        <p className="text-royal-gray">{courseGroup.description}</p>
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
                            <TableHead className="w-32">Lectures Count</TableHead>
                            <TableHead className="w-48">Created By</TableHead>
                            <TableHead className="w-32">Created At</TableHead>
                            <TableHead className="sticky right-0 bg-white z-10">
                                <Button className="w-24" onClick={handleAddCourse}>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Create
                                </Button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No courses found. Create your first course!
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course) => (
                                <TableRow key={course._id}>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell className="max-w-xs truncate">{course.description}</TableCell>
                                    <TableCell>{course.lectures?.length || 0}</TableCell>
                                    <TableCell>{course.createdBy?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="sticky right-0 bg-white z-10">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewCourse(course._id)}
                                                title="View Details"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(course)}
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(course._id)}
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

            <CourseModal
                isOpen={isCourseModalOpen}
                closeDialog={handleCloseModal}
                editingCourse={editingCourse}
                onCourseSaved={handleCourseSaved}
                courseGroupId={id}
            />
        </div>
    );
}