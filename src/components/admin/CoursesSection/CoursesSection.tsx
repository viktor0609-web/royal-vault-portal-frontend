import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminState } from "@/hooks/useAdminState";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCapIcon, Trash2, Edit, PlusIcon, EyeIcon } from "lucide-react";
import { GroupModal } from "./GroupModal";
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";


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
  courses: any[];
  createdAt: string;
  updatedAt: string;
  displayOnPublicPage?: boolean;
}


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
    getCurrentSection
  } = useAdminState<CourseGroup[]>([], 'courseGroups');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CourseGroup | null>(null);

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

  const handleDelete = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this course group? This will also delete all associated courses and lectures.')) {
      try {
        await courseApi.deleteCourseGroup(groupId);
        fetchCourseGroups(); // Refresh the list
        toast({
          title: "Success",
          description: "Course group deleted successfully",
        });
      } catch (error: any) {
        console.error('Error deleting course group:', error);
        setError(error.response?.data?.message || 'Failed to delete course group');
        toast({
          title: "Error",
          description: error.response?.data?.message || 'Failed to delete course group',
          variant: "destructive",
        });
      }
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

  const fetchCourseGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use 'detailed' fields for admin list view to show course counts
      // Admin should see all courses, not just public ones
      const response = await courseApi.getAllCourseGroups({}, 'detailed');
      // Handle new response structure with pagination
      const data = response.data?.data || response.data || [];
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

  useEffect(() => {
    fetchCourseGroups();
  }, []);

  return (
    <div className="flex-1 p-2 sm:p-4 flex flex-col animate-in fade-in duration-100 min-w-0 max-w-full overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-start sm:items-center justify-between bg-white p-3 sm:p-4 lg:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3 min-w-0">
        <div className="flex gap-2 items-center min-w-0 flex-1">
          <GraduationCapIcon className="h-6 w-6 sm:h-8 sm:w-8 text-royal-gray flex-shrink-0" />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-royal-dark-gray uppercase truncate">Course Groups</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg border border-royal-light-gray overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="w-48 min-w-48">Title</TableHead>
              <TableHead className="w-64 min-w-64 hidden xl:table-cell">Description</TableHead>
              <TableHead className="w-24 min-w-24 hidden 2xl:table-cell">Icon</TableHead>
              <TableHead className="w-32 min-w-32">Courses</TableHead>
              <TableHead className="w-32 min-w-32">Display</TableHead>
              <TableHead className="w-32 min-w-32 hidden xl:table-cell">Created By</TableHead>
              <TableHead className="w-32 min-w-32 hidden 2xl:table-cell">Created At</TableHead>
              <TableHead className="w-32 min-w-32 text-right">
                <Button className="w-20 sm:w-24 text-xs sm:text-sm" onClick={handleAddCourseGroup}>
                  <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Create</span>
                  <span className="sm:hidden">+</span>
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
              courseGroups.map((group) => (
                <TableRow key={group._id} onClick={() => handleViewGroup(group._id)} className="cursor-pointer">
                  <TableCell className="font-medium">{group.title}</TableCell>
                  <TableCell className="max-w-xs truncate hidden xl:table-cell">{group.description}</TableCell>
                  <TableCell className="hidden 2xl:table-cell">
                    <span className="text-sm text-gray-500">{group.icon}</span>
                  </TableCell>
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
                  <TableCell className="hidden xl:table-cell">{group.createdBy?.name || 'N/A'}</TableCell>
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
          courseGroups.map((group) => (
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
                    title="Delete"
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
                  <span className="hidden sm:inline truncate">{group.createdBy?.name || 'N/A'}</span>
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
    </div>
  );
}