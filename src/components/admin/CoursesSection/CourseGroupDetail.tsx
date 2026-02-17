import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminState } from "@/hooks/useAdminState";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import { ScrollableTable, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, Edit, Trash2, PlayIcon, ChevronUp, ChevronDown, ArrowRightLeft } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { DragHandle, DISPLAY_ORDER_HEADER, DropIndicatorRow } from "./DragHandle";
import { CourseModal } from "./CourseModal";
import { MoveCourseDialog } from "./MoveCourseDialog";
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
import type { CourseGroup, Course, Lecture, CourseResource } from "@/types";

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

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [courseToMove, setCourseToMove] = useState<Course | null>(null);
    const [draggedCourseIndex, setDraggedCourseIndex] = useState<number | null>(null);
    /** Index before which to show the drop line (0..length). null = no indicator. */
    const [dropIndicatorBeforeIndex, setDropIndicatorBeforeIndex] = useState<number | null>(null);
    const dropIndicatorBeforeIndexRef = useRef<number | null>(null);

    const handleDelete = (e: React.MouseEvent, courseId: string) => {
        e.stopPropagation();
        setCourseToDelete(courseId);
        setDeleteDialogOpen(true);
    };

    const handleMove = (e: React.MouseEvent, course: Course) => {
        e.stopPropagation();
        setCourseToMove(course);
        setMoveDialogOpen(true);
    };

    const handleCourseMoved = () => {
        setCourseToMove(null);
        setMoveDialogOpen(false);
        fetchCourseGroup();
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;

        try {
            await courseApi.deleteCourse(courseToDelete);
            fetchCourseGroup(); // Refresh the data
            toast({
                title: "Success",
                description: "Course deleted successfully",
            });
            setDeleteDialogOpen(false);
            setCourseToDelete(null);
        } catch (error: any) {
            console.error('Error deleting course:', error);
            setError(error.response?.data?.message || 'Failed to delete course');
            setDeleteDialogOpen(false);
            setCourseToDelete(null);
            toast({
                title: "Error",
                description: error.response?.data?.message || 'Failed to delete course',
                variant: "destructive",
            });
        }
    };

    const handleToggleDisplay = async (course: Course) => {
        try {
            const newDisplayValue = !course.displayOnPublicPage;
            await courseApi.updateCourse(course._id, { displayOnPublicPage: newDisplayValue });
            setCourses(prev =>
                prev.map(c => c._id === course._id ? { ...c, displayOnPublicPage: newDisplayValue } : c)
            );
            toast({
                title: "Success",
                description: `Course ${newDisplayValue ? 'enabled' : 'disabled'} for public pages`,
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

    const handleViewCourse = (courseId: string) => {
        navigate(`/admin/courses/groups/${groupId}/courses/${courseId}`);
    };

    const handleCourseDragStart = (e: React.DragEvent, index: number) => {
        setDraggedCourseIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
        e.dataTransfer.setData("application/json", JSON.stringify({ index }));
    };

    const handleCourseDragOver = (e: React.DragEvent, rowIndex: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const row = e.currentTarget;
        const rect = row.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const insertBefore = e.clientY < mid ? rowIndex : rowIndex + 1;
        dropIndicatorBeforeIndexRef.current = insertBefore;
        setDropIndicatorBeforeIndex(insertBefore);
    };

    const handleCourseDragEnd = () => {
        setDraggedCourseIndex(null);
        setDropIndicatorBeforeIndex(null);
        dropIndicatorBeforeIndexRef.current = null;
    };

    const handleCourseDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const insertBeforeIndex = dropIndicatorBeforeIndexRef.current;
        setDropIndicatorBeforeIndex(null);
        dropIndicatorBeforeIndexRef.current = null;
        setDraggedCourseIndex(null);
        if (insertBeforeIndex === null) return;
        const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (isNaN(dragIndex) || dragIndex === insertBeforeIndex || !groupId) return;
        const reordered = [...courses];
        const [removed] = reordered.splice(dragIndex, 1);
        // When dragging down, indices shift after removal: insert at insertBeforeIndex - 1 so the item lands between the two.
        const insertAt = dragIndex < insertBeforeIndex ? insertBeforeIndex - 1 : insertBeforeIndex;
        reordered.splice(insertAt, 0, removed);
        setCourses(reordered);
        try {
            await courseApi.reorderCoursesInGroup(groupId, reordered.map((c) => c._id));
            toast({ title: "Order updated", description: "Course order saved for public display." });
        } catch (err: any) {
            setCourses(courses);
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to save order",
                variant: "destructive",
            });
        }
    };

    const handleMoveCourseUp = async (index: number) => {
        if (index <= 0 || !groupId) return;
        const reordered = [...courses];
        [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
        setCourses(reordered);
        try {
            await courseApi.reorderCoursesInGroup(groupId, reordered.map((c) => c._id));
            toast({ title: "Order updated", description: "Course order saved." });
        } catch (err: any) {
            setCourses(courses);
            toast({ title: "Error", description: err.response?.data?.message || "Failed to save order", variant: "destructive" });
        }
    };

    const handleMoveCourseDown = async (index: number) => {
        if (index >= courses.length - 1 || !groupId) return;
        const reordered = [...courses];
        [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
        setCourses(reordered);
        try {
            await courseApi.reorderCoursesInGroup(groupId, reordered.map((c) => c._id));
            toast({ title: "Order updated", description: "Course order saved." });
        } catch (err: any) {
            setCourses(courses);
            toast({ title: "Error", description: err.response?.data?.message || "Failed to save order", variant: "destructive" });
        }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch only when groupId changes
    }, [groupId]);

    if (loading) {
        return (
            <div className="flex-1 p-2 sm:p-4 flex flex-col min-w-0">
                <Loading message="Loading courses..." />
            </div>
        );
    }

    if (error || !courseGroup) {
        return (
            <div className="flex-1 p-4">
                <PageHeader
                    back={{ to: '/admin/courses', label: 'Back to Courses' }}
                    title="Error"
                />
                <div className="text-center py-8 text-red-500 mt-4">{error || 'Course group not found'}</div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-2 sm:p-4 flex flex-col animate-in fade-in duration-100 min-w-0 max-w-full overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
            <div className="sticky top-[41px] z-30 mb-4 sm:mb-6 min-w-0">
                <PageHeader
                    icon={<span className="text-2xl sm:text-4xl">🎓</span>}
                    title={courseGroup.title}
                    description={courseGroup.description}
                    right={<BackButton to="/admin/courses" iconOnly title="Back to Courses" />}
                />
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Desktop Table View */}
            <ScrollableTable maxHeight="100%" className="hidden lg:block flex-1 min-h-0 mt-4 text-sm">
                        <TableHeader>
                            <TableRow className="border-b">
                                <TableHead className="w-10 min-w-10 py-2 px-2 text-center text-royal-gray font-medium" title="Drag to reorder public display order">
                                    {DISPLAY_ORDER_HEADER}
                                </TableHead>
                                <TableHead className="w-48 min-w-48 py-2 px-2">Title</TableHead>
                                <TableHead className="w-64 min-w-64 hidden xl:table-cell py-2 px-2">Description</TableHead>
                                <TableHead className="w-32 min-w-32 py-2 px-2">Lectures</TableHead>
                                <TableHead className="w-32 min-w-32 py-2 px-2">Display</TableHead>
                                <TableHead className="w-32 min-w-32 hidden xl:table-cell py-2 px-2">Created By</TableHead>
                                <TableHead className="w-32 min-w-32 hidden 2xl:table-cell py-2 px-2">Created At</TableHead>
                                <TableHead className="w-32 min-w-32 text-right py-2 px-2">
                                    <Button className="w-20 sm:w-24 text-xs sm:text-sm" onClick={handleAddCourse}>
                                        <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        <span>Create</span>
                                        <span className="sm:hidden">+</span>
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleCourseDrop(e)}
                        >
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        <Loading message="Loading courses..." size="md" />
                                    </TableCell>
                                </TableRow>
                            ) : courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        No courses found. Create your first course!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {courses.map((course, index) => (
                                        <React.Fragment key={course._id}>
                                            {dropIndicatorBeforeIndex === index && <DropIndicatorRow colSpan={8} />}
                                            <TableRow
                                                onClick={() => handleViewCourse(course._id)}
                                                className={`cursor-pointer transition-colors select-none ${draggedCourseIndex === index ? "opacity-50 bg-gray-50" : ""}`}
                                                onDragOver={(e) => handleCourseDragOver(e, index)}
                                            >
                                        <TableCell className="py-2 px-2 w-10 align-middle" onClick={(e) => e.stopPropagation()}>
                                            <DragHandle
                                                onDragStart={(e) => handleCourseDragStart(e, index)}
                                                onDragEnd={handleCourseDragEnd}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{course.title}</TableCell>
                                        <TableCell className="max-w-xs truncate hidden xl:table-cell">{course.description}</TableCell>
                                        <TableCell>{course.lectures?.length || 0}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={course.displayOnPublicPage || false}
                                                    onCheckedChange={() => handleToggleDisplay(course)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <span className="text-sm text-gray-600 hidden xl:inline">
                                                    {course.displayOnPublicPage ? 'Public' : 'Private'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden xl:table-cell">
                                            {typeof course.createdBy === 'object' && course.createdBy ? course.createdBy.name : 'N/A'}
                                        </TableCell>
                                        <TableCell className="hidden 2xl:table-cell">
                                            {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell className="w-40 min-w-40">
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => handleMove(e, course)}
                                                    title="Move to another group"
                                                >
                                                    <ArrowRightLeft className="h-4 w-4" />
                                                </Button>
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
                                                    title="Remove"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                        </React.Fragment>
                                    ))}
                                    {dropIndicatorBeforeIndex === courses.length && <DropIndicatorRow colSpan={8} />}
                                </>
                            )}
                        </TableBody>
            </ScrollableTable>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-3 sm:space-y-4 min-w-0 max-w-full overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
                {/* Add Button for Mobile */}
                <div className="flex justify-end">
                    <Button onClick={handleAddCourse} className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                        <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Create</span>
                    </Button>
                </div>

                {loading ? (
                    <Loading message="Loading courses..." />
                ) : courses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No courses found. Create your first course!
                    </div>
                ) : (
                    courses.map((course, index) => (
                        <div key={course._id} className="bg-white rounded-lg border border-royal-light-gray p-3 shadow-sm min-w-0">
                            <div className="flex items-start justify-between mb-2 cursor-pointer min-w-0" onClick={() => handleViewCourse(course._id)}>
                                <div className="flex-1 min-w-0 mr-2">
                                    <h3 className="font-semibold text-royal-dark-gray text-sm sm:text-base mb-1 line-clamp-2">{course.title}</h3>
                                    <p className="text-royal-gray text-xs sm:text-sm line-clamp-2">{course.description}</p>
                                </div>
                                <div className="flex gap-1 ml-2 flex-shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleMoveCourseUp(index); }}
                                        className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                        title="Move up"
                                        disabled={index === 0}
                                    >
                                        <ChevronUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleMoveCourseDown(index); }}
                                        className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                        title="Move down"
                                        disabled={index === courses.length - 1}
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleMove(e, course); }}
                                        className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                        title="Move to another group"
                                    >
                                        <ArrowRightLeft className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleEdit(e, course)}
                                        className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                        title="Edit"
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleDelete(e, course._id)}
                                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-red-600 hover:text-red-700"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs sm:text-sm text-royal-gray mb-2 min-w-0">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 flex-wrap">
                                    <span className="flex items-center gap-1 whitespace-nowrap">
                                        <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                        {course.lectures?.length || 0} lectures
                                    </span>
                                    <div className="flex items-center space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={course.displayOnPublicPage || false}
                                            onCheckedChange={() => handleToggleDisplay(course)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="text-xs">
                                            {course.displayOnPublicPage ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                    <span className="hidden sm:inline truncate">
                                        {typeof course.createdBy === 'object' && course.createdBy ? course.createdBy.name : 'N/A'}
                                    </span>
                                </div>
                                <span className="text-xs flex-shrink-0">{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}</span>
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

            <MoveCourseDialog
                isOpen={moveDialogOpen}
                onClose={() => { setMoveDialogOpen(false); setCourseToMove(null); }}
                course={courseToMove}
                currentGroupId={groupId}
                onMoved={handleCourseMoved}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
<AlertDialogTitle>Remove course</AlertDialogTitle>
                        <AlertDialogDescription>
                            Remove this course? This will also remove all associated lectures. This action cannot be undone.
                        </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setCourseToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Remove
            </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}