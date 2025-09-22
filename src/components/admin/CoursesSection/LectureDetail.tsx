import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminState } from "@/hooks/useAdminState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, Edit, Trash2, PlayIcon, CalendarIcon, ClockIcon, UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { courseApi } from "@/lib/api";

interface Lecture {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration?: number;
    order?: number;
    isPublished?: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Course {
    _id: string;
    title: string;
    description: string;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

export function LectureDetail() {
    const { groupId, courseId, lectureId } = useParams<{
        groupId: string;
        courseId: string;
        lectureId: string;
    }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Use admin state management
    const {
        state: lecture,
        setState: setLecture,
        isLoading: loading,
        error,
        setError,
        getUrlParams
    } = useAdminState<Lecture | null>(null, `lecture_${lectureId}`);

    const [course, setCourse] = useState<Course | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleBack = () => {
        navigate(`/admin/courses/groups/${groupId}/courses/${courseId}`);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleDelete = async () => {
        if (!lecture || !window.confirm('Are you sure you want to delete this lecture?')) {
            return;
        }

        try {
            await courseApi.deleteLecture(lectureId!);
            toast({
                title: "Success",
                description: "Lecture deleted successfully",
            });
            handleBack();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete lecture';
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const fetchLecture = async () => {
        if (!lectureId) return;

        try {
            setError(null);
            const response = await courseApi.getLectureById(lectureId);
            setLecture(response.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch lecture';
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const fetchCourse = async () => {
        if (!courseId) return;

        try {
            const response = await courseApi.getCourseById(courseId);
            setCourse(response.data);
        } catch (err: any) {
            console.error('Error fetching course:', err);
        }
    };

    useEffect(() => {
        fetchLecture();
        fetchCourse();
    }, [lectureId, courseId]);

    if (loading) {
        return (
            <div className="flex-1 p-4">
                <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
                    <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
                </div>
                <div className="animate-pulse bg-white rounded-lg p-6">
                    <div className="space-y-4">
                        <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
                        <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded"></div>
                        <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-4">
                <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
                    <ArrowLeftIcon
                        className="h-8 w-8 text-royal-gray cursor-pointer hover:text-royal-blue transition-colors"
                        onClick={handleBack}
                    />
                    <h1 className="text-2xl font-bold text-royal-dark-gray">Lecture Details</h1>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-red-800 font-medium mb-2">Error Loading Lecture</h3>
                    <p className="text-red-600">{error}</p>
                    <Button
                        onClick={fetchLecture}
                        className="mt-4"
                        variant="outline"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!lecture) {
        return (
            <div className="flex-1 p-4">
                <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
                    <ArrowLeftIcon
                        className="h-8 w-8 text-royal-gray cursor-pointer hover:text-royal-blue transition-colors"
                        onClick={handleBack}
                    />
                    <h1 className="text-2xl font-bold text-royal-dark-gray">Lecture Details</h1>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                    <p className="text-royal-gray">Lecture not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4">
            {/* Header */}
            <div className="bg-white rounded-lg border border-royal-light-gray shadow-sm mb-6">
                <div className="px-6 py-4 border-b border-royal-light-gray">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-3 py-2 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded-md transition-all duration-200 group"
                        >
                            <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-sm font-medium">Back to Course</span>
                        </button>
                    </div>
                </div>
                <div className="px-6 py-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">{lecture.title}</h1>
                            {course && (
                                <div className="flex items-center gap-2 text-sm text-royal-gray">
                                    <span className="font-medium">Course:</span>
                                    <span className="px-2 py-1 bg-royal-light-gray rounded-md">{course.title}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleEdit}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 hover:bg-royal-blue hover:text-white transition-colors"
                            >
                                <Edit className="h-4 w-4" />
                                Edit Lecture
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video Player */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlayIcon className="h-5 w-5" />
                                Video Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lecture.videoUrl ? (
                                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <PlayIcon className="h-12 w-12 text-royal-gray mx-auto mb-2" />
                                        <p className="text-royal-gray">Video Player</p>
                                        <p className="text-sm text-royal-gray mt-1">URL: {lecture.videoUrl}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                    <p className="text-royal-gray">No video URL provided</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-royal-gray whitespace-pre-wrap">
                                {lecture.description || 'No description provided'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Lecture Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lecture Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-royal-gray" />
                                <div>
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-sm text-royal-gray">
                                        {new Date(lecture.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-royal-gray" />
                                <div>
                                    <p className="text-sm font-medium">Duration</p>
                                    <p className="text-sm text-royal-gray">
                                        {lecture.duration ? `${lecture.duration} minutes` : 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-royal-gray" />
                                <div>
                                    <p className="text-sm font-medium">Order</p>
                                    <p className="text-sm text-royal-gray">
                                        {lecture.order || 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-2">Status</p>
                                <Badge variant={lecture.isPublished ? "default" : "secondary"}>
                                    {lecture.isPublished ? "Published" : "Draft"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Course Info */}
                    {course && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium mb-2">{course.title}</p>
                                <p className="text-sm text-royal-gray mb-3">{course.description}</p>
                                <div className="text-sm text-royal-gray">
                                    <p>Created by: {course.createdBy.name}</p>
                                    <p>Created: {new Date(course.createdAt).toLocaleDateString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
