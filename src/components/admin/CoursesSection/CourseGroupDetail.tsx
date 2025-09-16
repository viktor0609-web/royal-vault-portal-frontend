import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    PlusIcon,
    EditIcon,
    TrashIcon,
    PlayIcon,
    ClockIcon,
    UserIcon,
    SearchIcon,
    FilterIcon,
    SortAscIcon,
    SortDescIcon,
    GridIcon,
    ListIcon,
    MoreHorizontalIcon,
    DownloadIcon,
    UploadIcon,
    EyeIcon,
    StarIcon,
    TrendingUpIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CourseModal } from "./CourseModal";
import { useToast } from "@/hooks/use-toast";

interface Course {
    _id: string;
    title: string;
    description: string;
    duration: string;
    level: string;
    lectures: Lecture[];
}

interface Lecture {
    _id: string;
    title: string;
    description: string;
    duration: string;
    videoUrl?: string;
    order: number;
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

// Smart mock data for courses with variety
const mockCourses: Course[] = [
    {
        _id: "course-1",
        title: "Digital Privacy Fundamentals",
        description: "Learn the basics of protecting your digital identity and maintaining anonymity online.",
        duration: "2 hours",
        level: "Beginner",
        lectures: [
            {
                _id: "lecture-1",
                title: "Introduction to Digital Privacy",
                description: "Understanding the importance of digital privacy",
                duration: "15 minutes",
                videoUrl: "https://example.com/video1",
                order: 1
            },
            {
                _id: "lecture-2",
                title: "VPN and Proxy Services",
                description: "How to use VPNs and proxies effectively",
                duration: "25 minutes",
                videoUrl: "https://example.com/video2",
                order: 2
            },
            {
                _id: "lecture-3",
                title: "Browser Security",
                description: "Securing your web browser for maximum privacy",
                duration: "20 minutes",
                videoUrl: "https://example.com/video3",
                order: 3
            }
        ]
    },
    {
        _id: "course-2",
        title: "Advanced Anonymity Techniques",
        description: "Master advanced methods for complete anonymity and privacy protection.",
        duration: "4 hours",
        level: "Advanced",
        lectures: [
            {
                _id: "lecture-4",
                title: "Tor Network Deep Dive",
                description: "Understanding and using the Tor network effectively",
                duration: "30 minutes",
                videoUrl: "https://example.com/video4",
                order: 1
            },
            {
                _id: "lecture-5",
                title: "Cryptocurrency Privacy",
                description: "Using cryptocurrencies while maintaining privacy",
                duration: "35 minutes",
                videoUrl: "https://example.com/video5",
                order: 2
            }
        ]
    },
    {
        _id: "course-3",
        title: "Asset Protection Strategies",
        description: "Comprehensive guide to protecting your assets through legal structures.",
        duration: "3 hours",
        level: "Intermediate",
        lectures: [
            {
                _id: "lecture-6",
                title: "Trust Structures",
                description: "Understanding different types of trusts",
                duration: "45 minutes",
                videoUrl: "https://example.com/video6",
                order: 1
            },
            {
                _id: "lecture-7",
                title: "Offshore Entities",
                description: "Setting up offshore business entities",
                duration: "50 minutes",
                videoUrl: "https://example.com/video7",
                order: 2
            }
        ]
    },
    {
        _id: "course-4",
        title: "Tax Optimization Mastery",
        description: "Advanced tax strategies for high-net-worth individuals.",
        duration: "5 hours",
        level: "Advanced",
        lectures: [
            {
                _id: "lecture-8",
                title: "Tax Havens and Structures",
                description: "Understanding international tax planning",
                duration: "60 minutes",
                videoUrl: "https://example.com/video8",
                order: 1
            }
        ]
    },
    {
        _id: "course-5",
        title: "Estate Planning Essentials",
        description: "Planning for wealth transfer and generational wealth.",
        duration: "2.5 hours",
        level: "Intermediate",
        lectures: [
            {
                _id: "lecture-9",
                title: "Will and Trust Planning",
                description: "Creating effective estate plans",
                duration: "40 minutes",
                videoUrl: "https://example.com/video9",
                order: 1
            },
            {
                _id: "lecture-10",
                title: "Generational Wealth Transfer",
                description: "Strategies for multi-generational wealth",
                duration: "35 minutes",
                videoUrl: "https://example.com/video10",
                order: 2
            }
        ]
    }
];

export function CourseGroupDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Core state
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Smart features state
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"title" | "duration" | "level" | "lectures">("title");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [filterLevel, setFilterLevel] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            setCourses(mockCourses);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [id]);

    // Smart filtering and sorting
    const filteredAndSortedCourses = useMemo(() => {
        let filtered = courses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLevel = filterLevel === "all" || course.level === filterLevel;
            return matchesSearch && matchesLevel;
        });

        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case "title":
                    comparison = a.title.localeCompare(b.title);
                    break;
                case "duration":
                    // Convert duration to minutes for comparison
                    const getMinutes = (duration: string) => {
                        const match = duration.match(/(\d+)\s*(hour|minute)/i);
                        if (!match) return 0;
                        const value = parseInt(match[1]);
                        return match[2].toLowerCase().includes('hour') ? value * 60 : value;
                    };
                    comparison = getMinutes(a.duration) - getMinutes(b.duration);
                    break;
                case "level":
                    const levelOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3, "All Levels": 4 };
                    comparison = (levelOrder[a.level as keyof typeof levelOrder] || 0) -
                        (levelOrder[b.level as keyof typeof levelOrder] || 0);
                    break;
                case "lectures":
                    comparison = a.lectures.length - b.lectures.length;
                    break;
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });

        return filtered;
    }, [courses, searchQuery, sortBy, sortOrder, filterLevel]);

    // Smart analytics
    const analytics = useMemo(() => {
        const totalLectures = courses.reduce((sum, course) => sum + course.lectures.length, 0);
        const totalDuration = courses.reduce((sum, course) => {
            const match = course.duration.match(/(\d+)\s*hour/i);
            return sum + (match ? parseInt(match[1]) : 0);
        }, 0);
        const levelDistribution = courses.reduce((acc, course) => {
            acc[course.level] = (acc[course.level] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalCourses: courses.length,
            totalLectures,
            totalDuration,
            levelDistribution,
            averageLecturesPerCourse: courses.length > 0 ? (totalLectures / courses.length).toFixed(1) : 0
        };
    }, [courses]);

    // Smart handlers
    const handleAddCourse = useCallback(() => {
        setEditingCourse(null);
        setIsCourseModalOpen(true);
    }, []);

    const handleEditCourse = useCallback((course: Course) => {
        setEditingCourse(course);
        setIsCourseModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsCourseModalOpen(false);
        setEditingCourse(null);
    }, []);

    const handleCourseSaved = useCallback((courseData?: Course, isUpdate?: boolean) => {
        if (courseData) {
            if (isUpdate) {
                setCourses(prev =>
                    prev.map(course => course._id === courseData._id ? courseData : course)
                );
                toast({
                    title: "Course Updated",
                    description: `${courseData.title} has been updated successfully.`,
                });
            } else {
                setCourses(prev => [...prev, courseData]);
                toast({
                    title: "Course Created",
                    description: `${courseData.title} has been created successfully.`,
                });
            }
        }
    }, [toast]);

    const handleDeleteCourse = useCallback((courseId: string) => {
        const course = courses.find(c => c._id === courseId);
        setCourses(prev => prev.filter(course => course._id !== courseId));
        toast({
            title: "Course Deleted",
            description: course ? `${course.title} has been deleted.` : "Course deleted successfully.",
            variant: "destructive",
        });
    }, [courses, toast]);

    const handleBulkDelete = useCallback(() => {
        if (selectedCourses.length === 0) return;

        setCourses(prev => prev.filter(course => !selectedCourses.includes(course._id)));
        setSelectedCourses([]);
        toast({
            title: "Bulk Delete",
            description: `${selectedCourses.length} courses have been deleted.`,
            variant: "destructive",
        });
    }, [selectedCourses, toast]);

    const handleSelectAll = useCallback(() => {
        if (selectedCourses.length === filteredAndSortedCourses.length) {
            setSelectedCourses([]);
        } else {
            setSelectedCourses(filteredAndSortedCourses.map(course => course._id));
        }
    }, [selectedCourses.length, filteredAndSortedCourses]);

    const handleCourseSelect = useCallback((courseId: string) => {
        setSelectedCourses(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    }, []);

    const handleCourseClick = useCallback((courseId: string) => {
        navigate(`/admin/courses/group/${id}/course/${courseId}`);
    }, [navigate, id]);

    const handleExportCourses = useCallback(() => {
        const data = filteredAndSortedCourses.map(course => ({
            title: course.title,
            description: course.description,
            duration: course.duration,
            level: course.level,
            lectures: course.lectures.length
        }));

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `courses-${id}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: "Export Complete",
            description: "Courses have been exported successfully.",
        });
    }, [filteredAndSortedCourses, id, toast]);

    if (loading) {
        return (
            <div className="flex-1 p-4">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/admin/courses")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Courses
                    </Button>
                </div>
                <div className="text-center py-8">Loading courses...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4">
            {/* Header with Analytics */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/admin/courses")}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back to Courses
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-royal-dark-gray">Course Group: {id}</h1>
                            <p className="text-royal-gray">Manage courses in this group</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleExportCourses}
                            className="flex items-center gap-2"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            Export
                        </Button>
                        <Button
                            onClick={handleAddCourse}
                            className="flex items-center gap-2 bg-royal-blue hover:bg-royal-blue/90"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Course
                        </Button>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <PlayIcon className="h-5 w-5 text-royal-blue" />
                                <div>
                                    <p className="text-sm text-royal-gray">Total Courses</p>
                                    <p className="text-2xl font-bold text-royal-dark-gray">{analytics.totalCourses}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <ClockIcon className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-royal-gray">Total Lectures</p>
                                    <p className="text-2xl font-bold text-royal-dark-gray">{analytics.totalLectures}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <TrendingUpIcon className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm text-royal-gray">Total Duration</p>
                                    <p className="text-2xl font-bold text-royal-dark-gray">{analytics.totalDuration}h</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <StarIcon className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm text-royal-gray">Avg Lectures</p>
                                    <p className="text-2xl font-bold text-royal-dark-gray">{analytics.averageLecturesPerCourse}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Smart Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-royal-gray" />
                        <Input
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="duration">Duration</SelectItem>
                                <SelectItem value="level">Level</SelectItem>
                                <SelectItem value="lectures">Lectures</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        >
                            {sortOrder === "asc" ? <SortAscIcon className="h-4 w-4" /> : <SortDescIcon className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FilterIcon className="h-4 w-4" />
                        </Button>
                        <div className="flex border rounded-md">
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("grid")}
                                className="rounded-r-none"
                            >
                                <GridIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className="rounded-l-none"
                            >
                                <ListIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                        <Select value={filterLevel} onValueChange={setFilterLevel}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter by level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                                <SelectItem value="All Levels">All Levels</SelectItem>
                            </SelectContent>
                        </Select>
                        {selectedCourses.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-royal-gray">{selectedCourses.length} selected</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <TrashIcon className="h-4 w-4 mr-1" />
                                    Delete Selected
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Course Display */}
            <div className="space-y-4">
                {/* Bulk Actions Header */}
                {filteredAndSortedCourses.length > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={selectedCourses.length === filteredAndSortedCourses.length}
                                onCheckedChange={handleSelectAll}
                            />
                            <span className="text-sm text-royal-gray">
                                {selectedCourses.length} of {filteredAndSortedCourses.length} selected
                            </span>
                        </div>
                        <div className="text-sm text-royal-gray">
                            Showing {filteredAndSortedCourses.length} courses
                        </div>
                    </div>
                )}

                {/* Courses Grid/List */}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedCourses.map((course) => (
                            <Card key={course._id} className="hover:shadow-lg transition-all duration-200 group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-2">
                                            <Checkbox
                                                checked={selectedCourses.includes(course._id)}
                                                onCheckedChange={() => handleCourseSelect(course._id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <CardTitle className="text-lg font-semibold text-royal-dark-gray group-hover:text-royal-blue transition-colors">
                                                {course.title}
                                            </CardTitle>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontalIcon className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleCourseClick(course._id)}>
                                                    <EyeIcon className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                                                    <EditIcon className="h-4 w-4 mr-2" />
                                                    Edit Course
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteCourse(course._id)}
                                                    className="text-red-600"
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-2" />
                                                    Delete Course
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent
                                    className="pt-0 cursor-pointer"
                                    onClick={() => handleCourseClick(course._id)}
                                >
                                    <p className="text-sm text-royal-gray mb-4 line-clamp-3">
                                        {course.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-royal-gray mb-3">
                                        <div className="flex items-center gap-1">
                                            <ClockIcon className="h-3 w-3" />
                                            {course.duration}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <UserIcon className="h-3 w-3" />
                                            {course.level}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <PlayIcon className="h-3 w-3" />
                                            {course.lectures.length} lectures
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        <Badge variant="outline" className="text-xs">
                                            {course.level}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {course.lectures.length} lectures
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredAndSortedCourses.map((course) => (
                            <Card key={course._id} className="hover:shadow-md transition-all duration-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <Checkbox
                                            checked={selectedCourses.includes(course._id)}
                                            onCheckedChange={() => handleCourseSelect(course._id)}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-royal-dark-gray mb-1">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-royal-gray mb-2 line-clamp-2">
                                                        {course.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-royal-gray">
                                                        <div className="flex items-center gap-1">
                                                            <ClockIcon className="h-3 w-3" />
                                                            {course.duration}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <UserIcon className="h-3 w-3" />
                                                            {course.level}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <PlayIcon className="h-3 w-3" />
                                                            {course.lectures.length} lectures
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCourseClick(course._id)}
                                                    >
                                                        <EyeIcon className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontalIcon className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                                                                <EditIcon className="h-4 w-4 mr-2" />
                                                                Edit Course
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteCourse(course._id)}
                                                                className="text-red-600"
                                                            >
                                                                <TrashIcon className="h-4 w-4 mr-2" />
                                                                Delete Course
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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

            {/* Empty States */}
            {filteredAndSortedCourses.length === 0 && courses.length > 0 && (
                <div className="text-center py-12">
                    <SearchIcon className="h-12 w-12 text-royal-gray mx-auto mb-4" />
                    <p className="text-royal-gray mb-4">No courses match your search criteria.</p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchQuery("");
                            setFilterLevel("all");
                        }}
                    >
                        Clear Filters
                    </Button>
                </div>
            )}

            {courses.length === 0 && (
                <div className="text-center py-12">
                    <PlayIcon className="h-12 w-12 text-royal-gray mx-auto mb-4" />
                    <p className="text-royal-gray mb-4">No courses found in this group.</p>
                    <Button onClick={handleAddCourse} className="bg-royal-blue hover:bg-royal-blue/90">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add First Course
                    </Button>
                </div>
            )}

            <CourseModal
                isOpen={isCourseModalOpen}
                closeDialog={handleCloseModal}
                editingCourse={editingCourse}
                onCourseSaved={handleCourseSaved}
            />
        </div>
    );
}
