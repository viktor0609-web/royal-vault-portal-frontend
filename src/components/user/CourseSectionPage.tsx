import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Loading } from "@/components/ui/Loading";
import { BackButton } from "@/components/ui/BackButton";
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
import type { CourseGroup, CourseCategory } from "@/types";

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

export function CourseSectionPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [sectionTitle, setSectionTitle] = useState<string>("");
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, groupsRes] = await Promise.all([
          courseApi.getAllCategories(),
          courseApi.getCourseGroupsByCategory(categoryId, true),
        ]);
        const categories = catRes.data.data || [];
        const cat = categories.find((c: CourseCategory) => c._id === categoryId);
        setSectionTitle(cat?.title ?? "Section");
        setGroups(groupsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching section:", err);
        setError("Failed to load section.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex-1 p-2 sm:p-4">
        <Loading message="Loading section..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-2 sm:p-4">
        <p className="text-center text-red-500">{error}</p>
        <p className="text-center mt-2">
          <BackButton to="/courses">Back to Courses</BackButton>
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="mb-4 sm:mb-6">
        <PageHeader
          back={{ to: "/courses", label: "Back to Courses" }}
          title={sectionTitle}
        />
      </div>
      {groups.length === 0 ? (
        <p className="text-royal-gray">No courses in this section.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {groups.map((group) => {
            const Icon = getIconForGroup(group.icon);
            return (
              <Link
                key={group._id}
                to={`/course-groups/${group._id}`}
                className="text-center p-3 sm:p-6 bg-card rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow duration-75 cursor-pointer block"
              >
                <div className="flex justify-center mb-3 sm:mb-4">
                  <Icon className="h-12 w-12 sm:h-16 sm:w-16 text-royal-gray" />
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-royal-dark-gray mb-2 line-clamp-2">
                  {group.title}
                </h3>
                <p className="text-xs sm:text-sm text-royal-gray leading-relaxed line-clamp-3">
                  {group.description}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
