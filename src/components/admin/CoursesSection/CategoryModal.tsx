import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { CourseCategory } from "@/types";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: CourseCategory | null;
  onSaved: () => void;
}

export function CategoryModal({ isOpen, onClose, editingCategory, onSaved }: CategoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle(editingCategory?.title ?? "");
      setDescription(editingCategory?.description ?? "");
    }
  }, [isOpen, editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (editingCategory) {
        await courseApi.updateCategory(editingCategory._id, { title: title.trim(), description: description.trim() });
        toast({ title: "Success", description: "Section updated." });
      } else {
        await courseApi.createCategory({ title: title.trim(), description: description.trim() });
        toast({ title: "Success", description: "Section created." });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save section",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>{editingCategory ? "Edit section" : "Add section"}</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cat-title">Title</Label>
            <Input
              id="cat-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Investing"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cat-desc">Description (optional)</Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for this section"
              rows={2}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Saving…" : editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
