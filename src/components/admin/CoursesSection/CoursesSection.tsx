import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminState } from "@/hooks/useAdminState";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import { ScrollableTable, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCapIcon, Trash2, Edit, PlusIcon, ChevronUp, ChevronDown, LayoutList } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DragHandle, DISPLAY_ORDER_HEADER, DropIndicatorRow } from "./DragHandle";
import { GroupModal } from "./GroupModal";
import { CategoryModal } from "./CategoryModal";
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
import type { CourseGroup, CourseCategory } from "@/types";

export function CoursesSection() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use admin state management
  const {
    state: courseGroups,
    setState: setCourseGroups,
    isLoading: loading,
    setIsLoading,
    error,
    setError,
  } = useAdminState<CourseGroup[]>([], 'courseGroups');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CourseGroup | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [draggedGroupIndex, setDraggedGroupIndex] = useState<number | null>(null);
  /** Index before which to show the drop line (0..length). null = no indicator. */
  const [dropIndicatorBeforeIndex, setDropIndicatorBeforeIndex] = useState<number | null>(null);
  const dropIndicatorBeforeIndexRef = useRef<number | null>(null);

  const handleAddCourseGroup = () => {
    setEditingGroup(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleGroupSaved = (groupData?: CourseGroup, isUpdate?: boolean) => {
    if (groupData) {
      if (isUpdate) {
        setCourseGroups(prev =>
          prev.map(group => group._id === groupData._id ? groupData : group)
        );
      } else {
        setCourseGroups(prev => [...prev, groupData]);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, group: CourseGroup) => {
    e.stopPropagation();
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setGroupToDelete(groupId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      await courseApi.deleteCourseGroup(groupToDelete);
      fetchCourseGroups(); // Refresh the list
      toast({
        title: "Success",
        description: "Course group deleted successfully",
      });
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    } catch (error: any) {
      console.error('Error deleting course group:', error);
      setError(error.response?.data?.message || 'Failed to delete course group');
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to delete course group',
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  const handleToggleDisplay = async (group: CourseGroup) => {
    try {
      const newDisplayValue = !group.displayOnPublicPage;
      await courseApi.updateCourseGroup(group._id, { displayOnPublicPage: newDisplayValue });
      setCourseGroups(prev =>
        prev.map(g => g._id === group._id ? { ...g, displayOnPublicPage: newDisplayValue } : g)
      );
      toast({
        title: "Success",
        description: `Course group ${newDisplayValue ? 'enabled' : 'disabled'} for public pages`,
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

  const handleViewGroup = (groupId: string) => {
    navigate(`/admin/courses/groups/${groupId}`);
  };

  const handleGroupDragStart = (e: React.DragEvent, index: number) => {
    setDraggedGroupIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleGroupDragOver = (e: React.DragEvent, rowIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const row = e.currentTarget;
    const rect = row.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    const insertBefore = e.clientY < mid ? rowIndex : rowIndex + 1;
    dropIndicatorBeforeIndexRef.current = insertBefore;
    setDropIndicatorBeforeIndex(insertBefore);
  };

  const handleGroupDragEnd = () => {
    setDraggedGroupIndex(null);
    setDropIndicatorBeforeIndex(null);
    dropIndicatorBeforeIndexRef.current = null;
  };

  const handleGroupDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const insertBeforeIndex = dropIndicatorBeforeIndexRef.current;
    setDropIndicatorBeforeIndex(null);
    dropIndicatorBeforeIndexRef.current = null;
    setDraggedGroupIndex(null);
    if (insertBeforeIndex === null) return;
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (isNaN(dragIndex) || dragIndex === insertBeforeIndex) return;
    const reordered = [...courseGroups];
    const [removed] = reordered.splice(dragIndex, 1);
    // When dragging down, indices shift after removal: insert at insertBeforeIndex - 1 so the item lands between the two.
    const insertAt = dragIndex < insertBeforeIndex ? insertBeforeIndex - 1 : insertBeforeIndex;
    reordered.splice(insertAt, 0, removed);
    setCourseGroups(reordered);
    try {
      await courseApi.reorderCourseGroups(reordered.map((g) => g._id));
      toast({ title: "Order updated", description: "Course group order saved for public display." });
    } catch (err: any) {
      setCourseGroups(courseGroups);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save order",
        variant: "destructive",
      });
    }
  };

  const handleMoveGroupUp = async (index: number) => {
    if (index <= 0) return;
    const reordered = [...courseGroups];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    setCourseGroups(reordered);
    try {
      await courseApi.reorderCourseGroups(reordered.map((g) => g._id));
      toast({ title: "Order updated", description: "Course group order saved." });
    } catch (err: any) {
      setCourseGroups(courseGroups);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to save order", variant: "destructive" });
    }
  };

  const handleMoveGroupDown = async (index: number) => {
    if (index >= courseGroups.length - 1) return;
    const reordered = [...courseGroups];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    setCourseGroups(reordered);
    try {
      await courseApi.reorderCourseGroups(reordered.map((g) => g._id));
      toast({ title: "Order updated", description: "Course group order saved." });
    } catch (err: any) {
      setCourseGroups(courseGroups);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to save order", variant: "destructive" });
    }
  };

  const fetchCourseGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use 'detailed' fields for admin list view to show course counts
      // Admin should see all courses, not just public ones
      const response = await courseApi.getAllCourseGroups({}, 'detailed');
      // Response structure: { data: CourseGroup[], pagination: {...} }
      const data = response.data.data || [];
      setCourseGroups(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch course groups';
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

  const fetchCategories = async () => {
    try {
      const res = await courseApi.getAllCategories();
      setCategories(res.data.data || []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCourseGroups();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
  }, []);

  return (
    <div className="flex-1 p-2 sm:p-4 flex flex-col animate-in fade-in duration-100 min-w-0 max-w-full overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
      <div className="hidden lg:block mb-2 sm:mb-3 min-w-0">
        <PageHeader
          icon={<GraduationCapIcon className="h-6 w-6 sm:h-8 sm:w-8 text-royal-gray" />}
          title="Course Groups"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Course sections (categories) */}
      <div className="bg-white rounded-lg border border-royal-light-gray p-3 sm:p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LayoutList className="h-5 w-5 text-royal-gray" />
            <h2 className="text-sm font-semibold text-royal-dark-gray">Course sections (categories)</h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setEditingCategory(null); setCategoryModalOpen(true); }}
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Add section
          </Button>
        </div>
        <p className="text-xs text-royal-gray mb-2">Sections group course groups on the main Courses page. Assign a section when editing a course group.</p>
        {categories.length === 0 ? (
          <p className="text-sm text-royal-gray">No sections yet. Add one to organize course groups on the public page.</p>
        ) : (
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-royal-light-gray/30">
                <span className="text-sm font-medium text-royal-dark-gray">{cat.title}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingCategory(cat); setCategoryModalOpen(true); }} title="Edit">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" onClick={() => { setCategoryToDelete(cat._id); setCategoryDeleteDialogOpen(true); }} title="Remove">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Desktop Table View */}
      <ScrollableTable maxHeight="100%" className="hidden lg:block flex-1 min-h-0 mt-4 text-sm">
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-10 min-w-10 py-2 px-2 text-center text-royal-gray font-medium" title="Drag to reorder public display order">
                  {DISPLAY_ORDER_HEADER}
                </TableHead>
                <TableHead className="w-48 min-w-48 px-2">Title</TableHead>
                <TableHead className="w-64 min-w-64 hidden xl:table-cell py-2 px-2">Description</TableHead>
                <TableHead className="w-32 min-w-32 py-2 px-2">Courses</TableHead>
                <TableHead className="w-32 min-w-32 py-2 px-2">Display</TableHead>
                <TableHead className="w-32 min-w-32 hidden xl:table-cell py-2 px-2">Created By</TableHead>
                <TableHead className="w-32 min-w-32 hidden 2xl:table-cell py-2 px-2">Created At</TableHead>
                <TableHead className="w-32 min-w-32 text-right py-2 px-2">
                  <Button className="w-20 sm:w-24 text-xs sm:text-sm" onClick={handleAddCourseGroup}>
                    <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Create</span>
                    <span className="sm:hidden">+</span>
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleGroupDrop(e)}
            >
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loading message="Loading course groups..." size="md" />
                  </TableCell>
                </TableRow>
              ) : courseGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No course groups found. Create your first course group!
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {courseGroups.map((group, index) => (
                    <React.Fragment key={group._id}>
                      {dropIndicatorBeforeIndex === index && <DropIndicatorRow colSpan={8} />}
                      <TableRow
                        onClick={() => handleViewGroup(group._id)}
                        className={`cursor-pointer transition-colors select-none ${draggedGroupIndex === index ? "opacity-50 bg-gray-50" : ""}`}
                        onDragOver={(e) => handleGroupDragOver(e, index)}
                      >
                    <TableCell className="py-2 px-2 w-10 align-middle" onClick={(e) => e.stopPropagation()}>
                      <DragHandle
                        onDragStart={(e) => handleGroupDragStart(e, index)}
                        onDragEnd={handleGroupDragEnd}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{group.title}</TableCell>
                    <TableCell className="max-w-xs truncate hidden xl:table-cell">{group.description}</TableCell>
                    <TableCell>{group.courses?.length || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={group.displayOnPublicPage || false}
                          onCheckedChange={() => handleToggleDisplay(group)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm text-gray-600 hidden xl:inline">
                          {group.displayOnPublicPage ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {typeof group.createdBy === 'object' && group.createdBy ? group.createdBy.name : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden 2xl:table-cell">
                      {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="w-40 min-w-40">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleEdit(e, group)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => handleDelete(e, group._id)}
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                    </React.Fragment>
                  ))}
                  {dropIndicatorBeforeIndex === courseGroups.length && <DropIndicatorRow colSpan={8} />}
                </>
              )}
            </TableBody>
      </ScrollableTable>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-3 sm:space-y-4 min-w-0 max-w-full overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
        {/* Add Button for Mobile */}
        <div className="flex justify-end">
          <Button onClick={handleAddCourseGroup} className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
            <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Create</span>
          </Button>
        </div>

        {loading ? (
          <Loading message="Loading course groups..." />
        ) : courseGroups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No course groups found. Create your first course group!
          </div>
        ) : (
          courseGroups.map((group, index) => (
            <div key={group._id} className="bg-white rounded-lg border border-royal-light-gray p-3 shadow-sm min-w-0">
              <div className="flex items-start justify-between mb-2 cursor-pointer min-w-0" onClick={() => handleViewGroup(group._id)}>
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-semibold text-royal-dark-gray text-sm sm:text-base mb-1 line-clamp-2">{group.title}</h3>
                  <p className="text-royal-gray text-xs sm:text-sm line-clamp-2">{group.description}</p>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleMoveGroupUp(index); }}
                    className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                    title="Move up"
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleMoveGroupDown(index); }}
                    className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                    title="Move down"
                    disabled={index === courseGroups.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleEdit(e, group)}
                    className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                    title="Edit"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleDelete(e, group._id)}
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
                    <GraduationCapIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    {group.courses?.length || 0} courses
                  </span>
                  <div className="flex items-center space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={group.displayOnPublicPage || false}
                      onCheckedChange={() => handleToggleDisplay(group)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xs">
                      {group.displayOnPublicPage ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <span className="hidden sm:inline truncate">
                    {typeof group.createdBy === 'object' && group.createdBy ? group.createdBy.name : 'N/A'}
                  </span>
                </div>
                <span className="text-xs flex-shrink-0">{group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <GroupModal
        isOpen={isModalOpen}
        closeDialog={handleCloseModal}
        editingGroup={editingGroup}
        onGroupSaved={handleGroupSaved}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => { setCategoryModalOpen(false); setEditingCategory(null); }}
        editingCategory={editingCategory}
        onSaved={fetchCategories}
      />

      <AlertDialog open={categoryDeleteDialogOpen} onOpenChange={setCategoryDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove section</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this section? Course groups in it will no longer be grouped under a section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setCategoryDeleteDialogOpen(false); setCategoryToDelete(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!categoryToDelete) return;
                try {
                  await courseApi.deleteCategory(categoryToDelete);
                  toast({ title: "Success", description: "Section removed." });
                  fetchCategories();
                } catch (err: any) {
                  toast({ title: "Error", description: err.response?.data?.message || "Failed to remove", variant: "destructive" });
                }
                setCategoryDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove course group</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this course group? This will also remove all associated courses and lectures. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setGroupToDelete(null);
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