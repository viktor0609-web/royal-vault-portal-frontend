import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    ArrowLeftIcon,
    GraduationCapIcon,
    ClockIcon,
    PlayIcon,
    CheckCircleIcon,
} from "lucide-react";
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
    createdAt: string;
    updatedAt: string;
}

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
    updatedAt: string;
}

interface Lecture {
    _id: string;
    title: string;
    description?: string;
    content?: string;
    youtubeUrl?: string;
    youtubeVideoId?: string;
    relatedFiles: {
        name: string;
        uploadedUrl: string;
    }[];
    completedBy: string[];
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Icon mapping for course groups
const getIconForGroup = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
        'eye-off': '👁️‍🗨️',
        'network': '🌐',
        'refresh-cw': '🔄',
        'key': '🔑',
        'truck': '🚛',
        'graduation-cap': '🎓',
        'clock': '⏰',
    };
    return iconMap[iconName] || '📚';
};

export function CourseGroupDetailSection() {
    const { groupId } = useParams<{ groupId: string }>();
    const [courseGroup, setCourseGroup] = useState<CourseGroup | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourseGroup = async () => {
            if (!groupId) return;

            try {
                setLoading(true);
                const response = await courseApi.getCourseGroupById(groupId);
                setCourseGroup(response.data);
            } catch (err) {
                console.error('Error fetching course group:', err);
                setError('Failed to load course group. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseGroup();
    }, [groupId]);

    if (loading) {
        return (
            <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
                <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-6">
                    <div className="text-4xl">{getIconForGroup('graduation-cap')}</div>
                    <div>
                        <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">Loading...</h1>
                        <p className="text-royal-gray">Please wait while we load the course group.</p>
                    </div>
                </div>
                <div className="text-center py-8">Loading courses...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
                <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-6">
                    <div className="text-4xl">{getIconForGroup('graduation-cap')}</div>
                    <div>
                        <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">Error</h1>
                        <p className="text-royal-gray">Failed to load course group.</p>
                    </div>
                </div>
                <div className="text-center py-8 text-red-500">{error}</div>
            </div>
        );
    }

    if (!courseGroup) {
        return (
            <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
                <div className="text-center py-8">
                    <h2 className="text-xl font-semibold text-royal-dark-gray mb-2">Course Group Not Found</h2>
                    <p className="text-royal-gray mb-4">The requested course group could not be found.</p>
                    <Button onClick={() => navigate('/courses')} variant="outline">
                        Back to Courses
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-6">
                <div className="text-4xl">{getIconForGroup(courseGroup.icon)}</div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">{courseGroup.title}</h1>
                    <p className="text-royal-gray">{courseGroup.description}</p>
                </div>
                <div
                    className="cursor-pointer p-2 rounded-lg hover:bg-royal-blue/5 transition-all duration-75 hover:scale-102"
                    onClick={() => navigate('/courses')}
                    title="Back to Courses"
                >
                    <ArrowLeftIcon className="h-6 w-6 text-royal-gray hover:text-royal-blue transition-colors duration-75" />
                </div>
            </div>

            {/* Courses Grid */}
            {courseGroup.courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {courseGroup.courses.map((course) => (
                        <Link
                            key={course._id}
                            to={`/courses/${course._id}`}
                            className="bg-white p-6 rounded-lg border border-royal-light-gray hover:shadow-md transition-all duration-200 hover:scale-105 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-royal-blue/10 rounded-lg flex items-center justify-center">
                                        <PlayIcon className="h-6 w-6 text-royal-blue" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-royal-dark-gray group-hover:text-royal-blue transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-royal-gray">
                                            {course.lectures.length} lecture{course.lectures.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-royal-gray text-sm mb-4 line-clamp-3">
                                {course.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-royal-gray">
                                    <ClockIcon className="h-4 w-4" />
                                    <span>Self-paced</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-royal-gray">Start Course</span>
                                    <ArrowLeftIcon className="h-4 w-4 text-royal-gray rotate-180" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-royal-dark-gray mb-2">No Courses Available</h3>
                    <p className="text-royal-gray">This course group doesn't have any courses yet.</p>
                </div>
            )}
        </div>
    );
}
