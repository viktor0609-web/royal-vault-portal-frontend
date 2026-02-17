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
import type { Lecture, CourseGroup, Course } from "@/types";

interface MoveLectureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture | null;
  currentCourseId: string | undefined;
  onMoved: () => void;
}

export function MoveLectureDialog({
  isOpen,
  onClose,
  lecture,
  currentCourseId,
  onMoved,
}: MoveLectureDialogProps) {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCourseId(null);
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await courseApi.getAllCourseGroups(
          { publicOnly: false, limit: 100 },
          "detailed"
        );
        const data = res.data.data ?? [];
        setGroups(Array.isArray(data) ? data : []);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load courses",
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
    if (!lecture || !selectedCourseId) return;
    setMoving(true);
    try {
      await courseApi.moveLectureToCourse(lecture._id, selectedCourseId);
      toast({
        title: "Success",
        description: "Lesson moved to the selected course.",
      });
      onMoved();
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to move lesson",
        variant: "destructive",
      });
    } finally {
      setMoving(false);
    }
  };

  const targetCourses: { group: CourseGroup; course: Course }[] = [];
  groups.forEach((group) => {
    const courses = group.courses || [];
    courses.forEach((course) => {
      if (course._id !== currentCourseId) {
        targetCourses.push({ group, course });
      }
    });
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Move lesson to another course</DialogTitle>
          <DialogDescription>
            {lecture
              ? `Move "${lecture.title}" to a different course. It will be removed from the current course.`
              : "Select a target course."}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-royal-gray py-4">Loading courses...</p>
        ) : targetCourses.length === 0 ? (
          <p className="text-sm text-royal-gray py-4">
            No other courses available. Create another course in a group first.
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {groups.map((group) => {
              const coursesInGroup = (group.courses || []).filter(
                (c) => c._id !== currentCourseId
              );
              if (coursesInGroup.length === 0) return null;
              return (
                <div key={group._id}>
                  <p className="text-xs font-semibold text-royal-gray uppercase tracking-wide mb-1">
                    {group.title}
                  </p>
                  <ul className="space-y-1">
                    {coursesInGroup.map((course) => (
                      <li key={course._id}>
                        <button
                          type="button"
                          onClick={() => setSelectedCourseId(course._id)}
                          className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                            selectedCourseId === course._id
                              ? "border-royal-dark-gray bg-royal-light-gray/50"
                              : "border-royal-light-gray hover:bg-royal-light-gray/30"
                          }`}
                        >
                          {course.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!selectedCourseId || moving}
          >
            {moving ? "Moving…" : "Move here"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
