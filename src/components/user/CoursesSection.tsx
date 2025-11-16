import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  EyeOffIcon,
  NetworkIcon,
  RefreshCwIcon,
  KeyIcon,
  TruckIcon,
  GraduationCapIcon,
  ClockIcon,
  ArrowLeftIcon,
  HomeIcon
} from "lucide-react";
import { courseApi } from "@/lib/api";
import { markChecklistItemCompleted, CHECKLIST_ITEMS } from "@/utils/checklistUtils";


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
  courses: Course[];
  createdAt: string;
  updatedAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  courseGroup: string;
  lectures: Lecture[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Lecture {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  relatedFiles: {
    name: string;
    uploadedUrl: string;
  }[];
  completedBy: string[];
  displayOnPublicPage?: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

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


export function CoursesSection() {
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Mark "Get tax, legal, & investing resources" as completed when CoursesSection is visited
    markChecklistItemCompleted(CHECKLIST_ITEMS.GET_RESOURCES);

    const fetchCourseGroups = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getAllCourseGroups();
        setCourseGroups(response.data);
      } catch (err) {
        console.error('Error fetching course groups:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseGroups();
  }, []);

  // Map course groups to display categories
  const displayCategories = courseGroups.map((group) => ({
    icon: getIconForGroup(group.icon),
    title: group.title,
    description: group.description,
    id: group._id,
  }));

  if (loading) {
    return (
      <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
        <div className="flex items-center gap-2 sm:gap-4 bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
          <GraduationCapIcon className="h-8 w-8 sm:h-12 sm:w-12 text-royal-gray hidden min-[700px]:block" />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2">COURSES</h1>
            <p className="text-xs sm:text-base text-royal-gray">
              Learn everything you need to know to optimize your asset protection and tax structure.
            </p>
          </div>
        </div>
        <div className="text-center py-4 sm:py-8 text-sm sm:text-base">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
        <div className="flex items-center gap-2 sm:gap-4 bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
          <GraduationCapIcon className="h-8 w-8 sm:h-12 sm:w-12 text-royal-gray hidden min-[700px]:block" />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2">COURSES</h1>
            <p className="text-xs sm:text-base text-royal-gray">
              Learn everything you need to know to optimize your asset protection and tax structure.
            </p>
          </div>
        </div>
        <div className="text-center py-4 sm:py-8 text-sm sm:text-base text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 sm:gap-4 bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
        <GraduationCapIcon className="h-8 w-8 sm:h-12 sm:w-12 text-royal-gray hidden min-[700px]:block" />
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2">COURSES</h1>
          <p className="text-xs sm:text-base text-royal-gray">
            Learn everything you need to know to optimize your asset protection and tax structure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-12">
        {displayCategories.map((category, index) => (
          <Link
            key={category.id}
            to={`/course-groups/${category.id}`}
            className="text-center p-3 sm:p-6 bg-card rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow duration-75 cursor-pointer block"
          >
            <div className="flex justify-center mb-3 sm:mb-4">
              <category.icon className="h-12 w-12 sm:h-16 sm:w-16 text-royal-gray" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-royal-dark-gray mb-2 line-clamp-2">
              {category.title}
            </h3>
            <p className="text-xs sm:text-sm text-royal-gray leading-relaxed line-clamp-3">
              {category.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}