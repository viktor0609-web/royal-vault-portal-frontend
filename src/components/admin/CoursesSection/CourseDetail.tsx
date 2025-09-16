import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    PlusIcon,
    EditIcon,
    TrashIcon,
    PlayIcon,
    ClockIcon,
    GripVerticalIcon,
    EyeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LectureModal } from "./LectureModal";
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Lecture {
    _id: string;
    name: string;
    content: string;
    url: string;
    videoFile?: File | string;
    order: number;
}

interface Course {
    _id: string;
    title: string;
    description: string;
    lectures: Lecture[];
}

// Mock data for lectures
const mockLectures: Lecture[] = [
    {
        _id: "lecture-1",
        name: "Introduction to Digital Privacy",
        content: "Understanding the importance of digital privacy and why it matters in today's world. This comprehensive guide covers the fundamentals of protecting your personal information online.",
        url: "https://example.com/lecture1",
        order: 1
    },
    {
        _id: "lecture-2",
        name: "VPN and Proxy Services",
        content: "Learn how to use VPNs and proxies effectively to protect your online identity. We'll cover different types of VPNs, how to choose the right one, and best practices for maximum security.",
        url: "https://example.com/lecture2",
        order: 2
    },
    {
        _id: "lecture-3",
        name: "Browser Security",
        content: "Securing your web browser for maximum privacy and protection against tracking. This includes configuring privacy settings, using secure extensions, and understanding browser fingerprinting.",
        url: "https://example.com/lecture3",
        order: 3
    },
    {
        _id: "lecture-4",
        name: "Email Privacy",
        content: "Protecting your email communications and using secure email services. Learn about encrypted email, secure email providers, and how to maintain privacy in your communications.",
        url: "https://example.com/lecture4",
        order: 4
    }
];

export function CourseDetail() {
    const { groupId, courseId } = useParams<{ groupId: string; courseId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
    const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

    const fetchCourse = async () => {
        if (!courseId) return;

        try {
            setLoading(true);
            const response = await courseApi.getCourseById(courseId);
            setCourse(response.data);
            setLectures(response.data.lectures || []);
        } catch (err: any) {
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
    }, [courseId, groupId]);

    const handleAddLecture = () => {
        setEditingLecture(null);
        setIsLectureModalOpen(true);
    };

    const handleEditLecture = (lecture: Lecture) => {
        setEditingLecture(lecture);
        setIsLectureModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsLectureModalOpen(false);
        setEditingLecture(null);
    };

    const handleLectureSaved = async (lectureData?: Lecture, isUpdate?: boolean) => {
        if (lectureData) {
            if (isUpdate) {
                setLectures(prev =>
                    prev.map(lecture => lecture._id === lectureData._id ? lectureData : lecture)
                );
            } else {
                setLectures(prev => [...prev, lectureData]);
            }
        }
        fetchCourse(); // Refresh the course data
    };

    const handleDeleteLecture = async (lectureId: string) => {
        try {
            await courseApi.deleteLecture(lectureId);
            setLectures(prev => prev.filter(lecture => lecture._id !== lectureId));
            toast({
                title: "Lecture Deleted",
                description: "Lecture has been deleted successfully.",
                variant: "destructive",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || 'Failed to delete lecture',
                variant: "destructive",
            });
        }
    };

    const handleReorderLectures = (fromIndex: number, toIndex: number) => {
        const newLectures = [...lectures];
        const [movedLecture] = newLectures.splice(fromIndex, 1);
        newLectures.splice(toIndex, 0, movedLecture);

        // Update order numbers
        const updatedLectures = newLectures.map((lecture, index) => ({
            ...lecture,
            order: index + 1
        }));

        setLectures(updatedLectures);
    };

    if (loading) {
        return (
            <div className="flex-1 p-4">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/admin/courses/group/${groupId}`)}
                        className="hover:bg-royal-blue/10 hover:border-royal-blue/20"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                    </Button>
                </div>
                <div className="text-center py-8">Loading lectures...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/admin/courses/group/${groupId}`)}
                        className="hover:bg-royal-blue/10 hover:border-royal-blue/20"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-royal-dark-gray">{course?.title}</h1>
                        <p className="text-royal-gray">{course?.description}</p>
                    </div>
                </div>
                <Button
                    onClick={handleAddLecture}
                    className="flex items-center gap-2 bg-royal-blue hover:bg-royal-blue/90"
                >
                    <PlusIcon className="h-4 w-4" />
                    Add Lecture
                </Button>
            </div>

            <div className="mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Course Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-royal-gray">{course?.description}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-royal-dark-gray">Lectures ({lectures.length})</h2>
                </div>

                {lectures.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-royal-gray mb-4">No lectures found in this course.</p>
                        <Button onClick={handleAddLecture} className="bg-royal-blue hover:bg-royal-blue/90">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add First Lecture
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {lectures
                            .sort((a, b) => a.order - b.order)
                            .map((lecture, index) => (
                                <Card key={lecture._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-royal-gray">
                                                <GripVerticalIcon className="h-4 w-4 cursor-move" />
                                                <span className="text-sm font-medium">#{lecture.order}</span>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-royal-dark-gray mb-1">
                                                            {lecture.name}
                                                        </h3>
                                                        <p className="text-sm text-royal-gray mb-2 line-clamp-2">
                                                            {lecture.content}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-xs text-royal-gray">
                                                            {lecture.url && (
                                                                <div className="flex items-center gap-1">
                                                                    <PlayIcon className="h-3 w-3" />
                                                                    <a
                                                                        href={lecture.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        View Content
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {lecture.videoFile && (
                                                                <div className="flex items-center gap-1">
                                                                    <PlayIcon className="h-3 w-3" />
                                                                    Video File Available
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-1">
                                                        {lecture.url && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => window.open(lecture.url, '_blank')}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditLecture(lecture)}
                                                        >
                                                            <EditIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteLecture(lecture._id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}
            </div>

            <LectureModal
                isOpen={isLectureModalOpen}
                closeDialog={handleCloseModal}
                editingLecture={editingLecture}
                onLectureSaved={handleLectureSaved}
                courseId={courseId || ""}
            />
        </div>
    );
}
