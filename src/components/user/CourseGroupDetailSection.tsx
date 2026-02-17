import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Loading } from "@/components/ui/Loading";
import { ArrowLeftIcon, ClockIcon, PlayIcon } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { courseApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { CourseGroup, Course, Lecture } from "@/types";

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
    const { user } = useAuth();

    useEffect(() => {
        const fetchCourseGroup = async () => {
            if (!groupId) return;

            try {
                setLoading(true);
                // Use publicOnly=true to filter on backend
                const response = await courseApi.getCourseGroupById(groupId, 'full', true);

                // Backend now filters displayOnPublicPage, so lectures are already filtered
                // Backend returns CourseGroup directly, so response.data is the CourseGroup
                const courseData = (response.data as any)?.data || (response.data as any);
                setCourseGroup(courseData);
            } catch (err) {
                console.error('Error fetching course group:', err);
                setError('Failed to load course group. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseGroup();
    }, [groupId, user]); // Refetch when user authentication state changes

    if (loading) {
        return (
            <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
                <PageHeader
                    icon={<span className="text-2xl sm:text-4xl">{getIconForGroup('graduation-cap')}</span>}
                    title="Course Group"
                    description="Loading course group details..."
                />
                <Loading message="Loading courses..." className="mt-4" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
                <PageHeader
                    icon={<span className="text-2xl sm:text-4xl">{getIconForGroup('graduation-cap')}</span>}
                    title="Error"
                    description="Failed to load course group."
                />
                <div className="text-center py-4 sm:py-8 text-sm sm:text-base text-red-500 mt-4">{error}</div>
            </div>
        );
    }

    if (!courseGroup) {
        return (
            <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
                <div className="text-center py-4 sm:py-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-royal-dark-gray mb-2">Course Group Not Found</h2>
                    <p className="text-sm sm:text-base text-royal-gray mb-3 sm:mb-4">The requested course group could not be found.</p>
                    <BackButton to="/courses">Back to Courses</BackButton>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-300">
            <div className="mb-4 sm:mb-6">
                <PageHeader
                    icon={<span className="text-2xl sm:text-4xl">{getIconForGroup(courseGroup.icon)}</span>}
                    title={courseGroup.title}
                    description={courseGroup.description}
                    right={<BackButton to="/courses" iconOnly title="Back to Courses" />}
                />
            </div>

            {/* Courses Grid */}
            {courseGroup.courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {courseGroup.courses.map((course) => (
                        <Link
                            key={course._id}
                            to={`/courses/${course._id}`}
                            className="bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray hover:shadow-md transition-all duration-200 hover:scale-105 group"
                        >
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-royal-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <PlayIcon className="h-4 w-4 sm:h-6 sm:w-6 text-royal-blue" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm sm:text-lg font-semibold text-royal-dark-gray group-hover:text-royal-blue transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-royal-gray">
                                            {course.lectures.length} lecture{course.lectures.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-royal-gray text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                                {course.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-royal-gray">
                                    <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>Self-paced</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs sm:text-sm text-royal-gray">Start Course</span>
                                    <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 text-royal-gray rotate-180" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📚</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-royal-dark-gray mb-2">No Courses Available</h3>
                    <p className="text-sm sm:text-base text-royal-gray">This course group doesn't have any courses yet.</p>
                </div>
            )}
        </div>
    );
}
