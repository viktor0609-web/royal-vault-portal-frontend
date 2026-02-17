import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Course, CourseGroup } from "@/types";

interface MoveCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  currentGroupId: string | undefined;
  onMoved: (updatedCourse?: Course) => void;
}

export function MoveCourseDialog({
  isOpen,
  onClose,
  course,
  currentGroupId,
  onMoved,
}: MoveCourseDialogProps) {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    setSelectedGroupId(null);
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await courseApi.getAllCourseGroups(
          { publicOnly: false, limit: 100 },
          "basic"
        );
        const data = res.data.data ?? [];
        setGroups(Array.isArray(data) ? data : []);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load course groups",
          variant: "destructive",
        });
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isOpen, toast]);

  const handleMove = async () => {
    if (!course || !selectedGroupId) return;
    setMoving(true);
    try {
      const res = await courseApi.moveCourseToGroup(course._id, selectedGroupId);
      const updatedCourse = res.data as Course;
      toast({
        title: "Success",
        description: "Course moved to the selected group.",
      });
      onMoved(updatedCourse);
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to move course",
        variant: "destructive",
      });
    } finally {
      setMoving(false);
    }
  };

  const targetGroups = groups.filter((g) => g._id !== currentGroupId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Move course to another group</DialogTitle>
          <DialogDescription>
            {course
              ? `Move "${course.title}" to a different course group. It will be removed from the current group.`
              : "Select a target course group."}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-royal-gray py-4">Loading course groups...</p>
        ) : targetGroups.length === 0 ? (
          <p className="text-sm text-royal-gray py-4">
            No other course groups available. Create another group first.
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 py-2">
            {targetGroups.map((group) => (
              <button
                key={group._id}
                type="button"
                onClick={() => setSelectedGroupId(group._id)}
                className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                  selectedGroupId === group._id
                    ? "border-royal-dark-gray bg-royal-light-gray/50"
                    : "border-royal-light-gray hover:bg-royal-light-gray/30"
                }`}
              >
                {group.title}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!selectedGroupId || moving}
          >
            {moving ? "Moving…" : "Move here"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
