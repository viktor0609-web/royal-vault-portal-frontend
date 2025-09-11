import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    courses: any[];
}

interface GroupModalProps {
    isOpen: boolean;
    closeDialog: () => void;
    editingGroup?: CourseGroup | null;
    onGroupSaved: (groupData?: CourseGroup, isUpdate?: boolean) => void;
}

export function GroupModal({ isOpen, closeDialog, editingGroup, onGroupSaved }: GroupModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        icon: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editingGroup) {
            setFormData({
                title: editingGroup.title || "",
                description: editingGroup.description || "",
                icon: editingGroup.icon || ""
            });
        } else {
            setFormData({
                title: "",
                description: "",
                icon: ""
            });
        }
    }, [editingGroup, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let response;
            if (editingGroup) {
                response = await courseApi.updateCourseGroup(editingGroup._id, formData);
            } else {
                response = await courseApi.createCourseGroup(formData);
            }
            onGroupSaved(response.data, !!editingGroup);
            closeDialog();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save course group");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogTitle className="text-xl font-semibold">
                    {editingGroup ? "Edit Course Group" : "Create Course Group"}
                </DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title" className="text-royal-dark-gray font-medium">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            className="mt-1"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description" className="text-royal-dark-gray font-medium">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className="mt-1"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="icon" className="text-royal-dark-gray font-medium">
                            Icon (Iconify class)
                        </Label>
                        <Input
                            id="icon"
                            value={formData.icon}
                            onChange={(e) => handleInputChange("icon", e.target.value)}
                            className="mt-1"
                            placeholder="e.g., material-symbols:school"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : editingGroup ? "Update" : "Create"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}