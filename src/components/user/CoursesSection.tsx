import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  EyeOffIcon,
  NetworkIcon,
  RefreshCwIcon,
  KeyIcon,
  TruckIcon,
  GraduationCapIcon,
  ClockIcon
} from "lucide-react";
import { courseApi } from "@/lib/api";


interface CourseGroup {
  _id: string;
  title: string;
  description: string;
  icon: string;
  createdBy: string;
  courses: any[];
}

// Default categories with icons for fallback
const defaultCategories = [
  {
    icon: EyeOffIcon,
    title: "Anonymity",
    description: "Make yourself invisible and prevent lawsuits before they begin.",
    id: "anonymity",
  },
  {
    icon: NetworkIcon,
    title: "Asset Holding",
    description: "Hold your assets anonymously and securely.",
    id: "asset-holding",
  },
  {
    icon: RefreshCwIcon,
    title: "Operations",
    description: "Run your business without liability.",
    id: "operations",
  },
  {
    icon: KeyIcon,
    title: "Estate Planning",
    description: "Transfer your wealth to future generations.",
    id: "estate-planning",
  },
  {
    icon: TruckIcon,
    title: "Tax Vehicles",
    description: "Optimize your taxes for the first $150k annual revenue.",
    id: "tax-vehicles",
  },
  {
    icon: GraduationCapIcon,
    title: "Royal Life 1.0",
    description: "Learn how to achieve an extraordinary life on every level.",
    id: "royal-life-1",
  },
  {
    icon: GraduationCapIcon,
    title: "Royal Life 2.0",
    description: "",
    id: "royal-life-2",
  },
  {
    icon: ClockIcon,
    title: "Coming Soon",
    description: "",
    id: "coming-soon",
  },
];

export function CoursesSection() {
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseGroups();
  }, []);

  const fetchCourseGroups = async () => {
    try {
      const response = await courseApi.getAllCourseGroups();
      setCourseGroups(response.data);
    } catch (err) {
      console.error("Failed to fetch course groups:", err);
      setError("Failed to load course groups");
    } finally {
      setLoading(false);
    }
  };

  // Use real course groups if available, otherwise fall back to default categories
  const displayCategories = courseGroups.length > 0
    ? courseGroups.map((group, index) => ({
      icon: defaultCategories[index % defaultCategories.length]?.icon || GraduationCapIcon,
      title: group.title,
      description: group.description,
      id: group._id,
    }))
    : defaultCategories;

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
          <GraduationCapIcon className="h-12 w-12 text-royal-gray" />
          <div>
            <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">COURSES</h1>
            <p className="text-royal-gray">
              Learn everything you need to know to optimize your asset protection and tax structure.
            </p>
          </div>
        </div>
        <div className="text-center py-8">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4">
        <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
          <GraduationCapIcon className="h-12 w-12 text-royal-gray" />
          <div>
            <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">COURSES</h1>
            <p className="text-royal-gray">
              Learn everything you need to know to optimize your asset protection and tax structure.
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
        <GraduationCapIcon className="h-12 w-12 text-royal-gray" />
        <div>
          <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">COURSES</h1>
          <p className="text-royal-gray">
            Learn everything you need to know to optimize your asset protection and tax structure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-6 mb-12">
        {displayCategories.map((category, index) => (
          <Link
            key={category.id}
            to={`/courses/${category.id}`}
            className="text-center p-6 bg-card rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow cursor-pointer block"
          >
            <div className="flex justify-center mb-4">
              <category.icon className="h-16 w-16 text-royal-gray" />
            </div>
            <h3 className="text-lg font-bold text-royal-dark-gray mb-2">
              {category.title}
            </h3>
            <p className="text-sm text-royal-gray leading-relaxed">
              {category.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}