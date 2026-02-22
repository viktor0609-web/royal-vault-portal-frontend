import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { GraduationCapIcon } from "lucide-react";
import { courseApi } from "@/lib/api";
import { markChecklistItemCompleted, CHECKLIST_ITEMS } from "@/utils/checklistUtils";
import { useAuth } from "@/context/AuthContext";
import type { CourseGroup, CourseCategory } from "@/types";

export function CoursesSection() {
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    markChecklistItemCompleted(CHECKLIST_ITEMS.GET_RESOURCES);

    const fetch = async () => {
      try {
        setLoading(true);
        const groupsRes = await courseApi.getAllCourseGroups({ publicOnly: true });
        const data = groupsRes.data.data || [];
        setCourseGroups(data);
      } catch (err) {
        console.error('Error fetching course groups:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  // Group course groups by category, ordered by category sortOrder then uncategorized last
  const sections = useMemo(() => {
    const byCategory = new Map<string | "uncategorized", { category: CourseCategory | null; groups: CourseGroup[] }>();

    for (const group of courseGroups) {
      const cat = group.category as CourseCategory | undefined;
      const key = cat && typeof cat === "object" ? cat._id : "uncategorized";
      const category = cat && typeof cat === "object" ? cat : null;

      if (!byCategory.has(key)) {
        byCategory.set(key, { category, groups: [] });
      }
      byCategory.get(key)!.groups.push(group);
    }

    // Sort: categories by sortOrder, then uncategorized last
    const uncategorized = byCategory.get("uncategorized");
    const categorized = Array.from(byCategory.entries())
      .filter(([k]) => k !== "uncategorized")
      .map(([, v]) => v)
      .sort((a, b) => {
        const orderA = a.category?.sortOrder ?? 9999;
        const orderB = b.category?.sortOrder ?? 9999;
        return orderA - orderB;
      });

    const result = [...categorized];
    if (uncategorized && uncategorized.groups.length > 0) {
      result.push(uncategorized);
    }
    return result;
  }, [courseGroups]);

  const coursesPageHeader = (
    <PageHeader
      icon={<GraduationCapIcon className="h-8 w-8 sm:h-12 sm:w-12 text-royal-gray" />}
      title="COURSES"
      description="Learn everything you need to know to optimize your asset protection and tax structure."
    />
  );

  if (loading) {
    return (
      <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
        <div className="mb-2 sm:mb-3 hidden sm:block">{coursesPageHeader}</div>
        <Loading message="Loading courses..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
        <div className="mb-2 sm:mb-3 hidden sm:block">{coursesPageHeader}</div>
        <div className="text-center py-4 sm:py-8 text-sm sm:text-base text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="mb-2 sm:mb-3 hidden sm:block">{coursesPageHeader}</div>

      {sections.map((section) => (
        <div key={section.category?._id ?? "uncategorized"} className="mb-8 sm:mb-12">
          {section.category?.title && (
            <h2 className="text-base sm:text-xl font-bold text-royal-dark-gray mb-3 sm:mb-4">
              {section.category.title}
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {section.groups.map((group) => (
              <Link
                key={group._id}
                to={`/course-groups/${group._id}`}
                className="text-center p-3 sm:p-6 bg-card rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow duration-75 cursor-pointer block"
              >
                <div className="flex justify-center mb-3 sm:mb-4">
                  <GraduationCapIcon className="h-12 w-12 sm:h-16 sm:w-16 text-royal-gray" />
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-royal-dark-gray mb-2 line-clamp-2">
                  {group.title}
                </h3>
                <p className="text-xs sm:text-sm text-royal-gray leading-relaxed line-clamp-3">
                  {group.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
