import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
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
}


export function CoursesSection() {
  const navigate = useNavigate();
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CourseGroup | null>(null);
  const { toast } = useToast();

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

  const handleEdit = (group: CourseGroup) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleDelete = async (groupId: string) => {
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

  const handleViewGroup = (groupId: string) => {
    navigate(`/admin/courses/group/${groupId}`);
  };

  const fetchCourseGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use 'detailed' fields for admin list view to show course counts
      const response = await courseApi.getAllCourseGroups({}, 'detailed');
      setCourseGroups(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch course groups');
      toast({
        title: "Error",
        description: err.response?.data?.message || 'Failed to fetch course groups',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseGroups();
  }, []);

  return (
    <div className="flex-1 p-4 flex flex-col">
      <div className="flex gap-4 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
        <GraduationCapIcon className="h-10 w-10 text-royal-gray hidden min-[700px]:block" />
        <h1 className="text-2xl font-bold text-royal-dark-gray mb-2 uppercase">Course Groups</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-royal-light-gray overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="text-xs text-gray-500 text-center py-2 bg-gray-50 border-b border-gray-200 sm:hidden">
          ← Scroll horizontally to see all columns →
        </div>
        <Table className="w-full min-w-[900px] text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="w-48 min-w-48">Title</TableHead>
              <TableHead className="w-64 min-w-64">Description</TableHead>
              <TableHead className="w-24 min-w-24">Icon</TableHead>
              <TableHead className="w-32 min-w-32">Courses Count</TableHead>
              <TableHead className="w-32 min-w-32">Created By</TableHead>
              <TableHead className="w-32 min-w-32">Created At</TableHead>
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
                <TableCell colSpan={7} className="text-center py-8">
                  Loading course groups...
                </TableCell>
              </TableRow>
            ) : courseGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No course groups found. Create your first course group!
                </TableCell>
              </TableRow>
            ) : (
              courseGroups.map((group) => (
                <TableRow key={group._id}>
                  <TableCell className="font-medium">{group.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{group.description}</TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">{group.icon}</span>
                  </TableCell>
                  <TableCell>{group.courses?.length || 0}</TableCell>
                  <TableCell>{group.createdBy?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="w-40 min-w-40">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewGroup(group._id)}
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(group)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(group._id)}
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

      <GroupModal
        isOpen={isModalOpen}
        closeDialog={handleCloseModal}
        editingGroup={editingGroup}
        onGroupSaved={handleGroupSaved}
      />
    </div>
  );
}