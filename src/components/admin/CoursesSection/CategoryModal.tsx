import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";
import type { CourseCategory } from "@/types";
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

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function CategoryModal({ isOpen, onClose, onSaved }: CategoryModalProps) {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await courseApi.getAllCategories();
      setCategories(res.data.data || []);
    } catch {
      setCategories([]);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setEditingCategory(null);
      setTitle("");
      setDescription("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingCategory) {
      setTitle(editingCategory.title ?? "");
      setDescription(editingCategory.description ?? "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [editingCategory]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (editingCategory) {
        await courseApi.updateCategory(editingCategory._id, {
          title: title.trim(),
          description: description.trim(),
        });
        toast({ title: "Success", description: "Category updated." });
      } else {
        await courseApi.createCategory({
          title: title.trim(),
          description: description.trim(),
        });
        toast({ title: "Success", description: "Category created." });
      }
      setEditingCategory(null);
      setTitle("");
      setDescription("");
      await fetchCategories();
      onSaved?.();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message ?? "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await courseApi.deleteCategory(categoryToDelete);
      toast({ title: "Success", description: "Category removed." });
      if (editingCategory?._id === categoryToDelete) {
        setEditingCategory(null);
        setTitle("");
        setDescription("");
      }
      await fetchCategories();
      onSaved?.();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message ?? "Failed to remove category",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage categories</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-royal-gray">
            Categories can be assigned to course groups when creating or editing a group.
          </p>

          <form onSubmit={handleSave} className="space-y-3 border-b border-royal-light-gray pb-4">
            <div>
              <Label htmlFor="cat-title">Title</Label>
              <Input
                id="cat-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Category name"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="cat-desc">Description (optional)</Label>
              <Textarea
                id="cat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingCategory ? "Update" : "Add category"}
              </Button>
              {editingCategory && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingCategory(null);
                    setTitle("");
                    setDescription("");
                  }}
                >
                  Cancel edit
                </Button>
              )}
            </div>
          </form>

          <div className="flex-1 overflow-y-auto min-h-0">
            <Label className="text-sm font-medium text-royal-dark-gray">Existing categories</Label>
            {loading ? (
              <p className="text-sm text-royal-gray py-2">Loading…</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-royal-gray py-2">No categories yet. Add one above.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {categories.map((cat) => (
                  <li
                    key={cat._id}
                    className={`flex items-center justify-between py-2 px-3 rounded-md border ${
                      editingCategory?._id === cat._id
                        ? "border-royal-dark-gray bg-royal-light-gray/50"
                        : "border-royal-light-gray"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-royal-dark-gray">{cat.title}</span>
                      {cat.description && (
                        <p className="text-xs text-royal-gray truncate">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingCategory(cat)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(cat._id)}
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove category</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this category? Course groups using it will have their category cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteDialogOpen(false); setCategoryToDelete(null); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
