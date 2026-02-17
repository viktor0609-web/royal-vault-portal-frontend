import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  EyeOffIcon,
  NetworkIcon,
  RefreshCwIcon,
  KeyIcon,
  TruckIcon,
  GraduationCapIcon,
  ClockIcon,
} from "lucide-react";
import { courseApi } from "@/lib/api";
import { markChecklistItemCompleted, CHECKLIST_ITEMS } from "@/utils/checklistUtils";
import { useAuth } from "@/context/AuthContext";
import type { CourseGroup, CourseCategory } from "@/types";

// Icon mapping for course groups
const getIconForGroup = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'eye-off': EyeOffIcon,
    'network': NetworkIcon,
    'refresh-cw': RefreshCwIcon,
    'key': KeyIcon,
    'truck': TruckIcon,
    'graduation-cap': GraduationCapIcon,
    'clock': ClockIcon,
  };
  return iconMap[iconName] || GraduationCapIcon;
};


const MAX_GROUPS_PER_SECTION = 6; // Show "See all" if more

export function CoursesSection() {
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    markChecklistItemCompleted(CHECKLIST_ITEMS.GET_RESOURCES);

    const fetch = async () => {
      try {
        setLoading(true);
        const [groupsRes, categoriesRes] = await Promise.all([
          courseApi.getAllCourseGroups({ publicOnly: true }),
          courseApi.getAllCategories().catch(() => ({ data: { data: [] } })),
        ]);
        const data = groupsRes.data.data || [];
        setCourseGroups(data);
        setCategories(categoriesRes.data?.data || []);
      } catch (err) {
        console.error('Error fetching course groups:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  // Group course groups by category (sections), ordered by category sortOrder, uncategorized last
  const sections = useMemo(() => {
    const withCategory = courseGroups.filter((g) => {
      const cat = g.category as CourseCategory | undefined;
      return cat && (typeof cat === 'object' ? cat._id : cat);
    });
    const uncategorized = courseGroups.filter((g) => {
      const cat = g.category as CourseCategory | undefined;
      return !cat || (typeof cat === 'object' ? !cat._id : !cat);
    });

    const byId = new Map<string, CourseGroup[]>();
    withCategory.forEach((g) => {
      const cat = g.category as CourseCategory;
      const id = typeof cat === 'object' ? cat._id : String(cat);
      if (!byId.has(id)) byId.set(id, []);
      byId.get(id)!.push(g);
    });

    const result: { category: CourseCategory | null; groups: CourseGroup[] }[] = [];
    categories.forEach((c) => {
      const groups = byId.get(c._id);
      if (groups && groups.length > 0) result.push({ category: c, groups });
    });
    if (uncategorized.length > 0) {
      result.push({ category: null, groups: uncategorized });
    }
    return result;
  }, [courseGroups, categories]);

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

      {sections.map((section) => {
        const sectionTitle = section.category ? section.category.title : null;
        const sectionId = section.category ? section.category._id : null;
        const groups = section.groups;
        const showSeeAll = sectionId && groups.length > MAX_GROUPS_PER_SECTION;
        const displayGroups = showSeeAll ? groups.slice(0, MAX_GROUPS_PER_SECTION) : groups;

        return (
          <div key={sectionId ?? 'uncategorized'} className="mb-8 sm:mb-12">
            {sectionTitle && (
              <h2 className="text-base sm:text-xl font-bold text-royal-dark-gray mb-3 sm:mb-4">
                {sectionTitle}
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {displayGroups.map((group) => (
                <Link
                  key={group._id}
                  to={`/course-groups/${group._id}`}
                  className="text-center p-3 sm:p-6 bg-card rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow duration-75 cursor-pointer block"
                >
                  <div className="flex justify-center mb-3 sm:mb-4">
                    {(() => {
                      const Icon = getIconForGroup(group.icon);
                      return <Icon className="h-12 w-12 sm:h-16 sm:w-16 text-royal-gray" />;
                    })()}
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
            {showSeeAll && (
              <div className="mt-4">
                <Link
                  to={`/courses/section/${sectionId}`}
                  className="text-sm font-medium text-royal-dark-gray hover:underline"
                >
                  See all →
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}