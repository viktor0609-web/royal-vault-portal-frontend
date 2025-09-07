import { useState } from "react";
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

const courseCategories = [
  {
    icon: EyeOffIcon,
    title: "Anonymity",
    description: "Make yourself invisible and prevent lawsuits before they begin.",
    path: "/courses/anonymity",
  },
  {
    icon: NetworkIcon,
    title: "Asset Holding",
    description: "Hold your assets anonymously and securely.",
    path: "/courses/asset-holding",
  },
  {
    icon: RefreshCwIcon,
    title: "Operations",
    description: "Run your business without liability.",
    path: "/courses/operations",
  },
  {
    icon: KeyIcon,
    title: "Estate Planning",
    description: "Transfer your wealth to future generations.",
    path: "/courses/estate-planning",
  },
  {
    icon: TruckIcon,
    title: "Tax Vehicles",
    description: "Optimize your taxes for the first $150k annual revenue.",
    path: "/courses/tax-vehicles",
  },
];

const courseLevels = [
  {
    icon: GraduationCapIcon,
    title: "Royal Life 1.0",
    description: "Learn how to achieve an extraordinary life on every level.",
    available: true,
  },
  {
    icon: GraduationCapIcon,
    title: "Royal Life 2.0",
    description: "",
    available: true,
  },
  {
    icon: ClockIcon,
    title: "Coming Soon",
    description: "",
    available: false,
  },
];

export function CoursesSection() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <GraduationCapIcon className="h-12 w-12 text-royal-gray" />
          <div>
            <h1 className="text-3xl font-bold text-royal-dark-gray mb-2">COURSES</h1>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-royal-light-gray mb-8">
          <p className="text-royal-gray">
            Learn everything you need to know to optimize your asset protection and tax structure.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 mb-12 justify-start">
          {courseCategories.map((category, index) => (
            <Link 
              key={index} 
              to={category.path}
              className="w-48 text-center p-6 bg-white rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow cursor-pointer block"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courseLevels.map((course, index) => (
            <div key={index} className="text-center p-8 bg-white rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow">
              <div className="flex justify-center mb-6">
                <course.icon className={`h-20 w-20 ${course.available ? 'text-royal-gray' : 'text-royal-light-gray'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-4 ${course.available ? 'text-royal-dark-gray' : 'text-royal-gray'}`}>
                {course.title}
              </h3>
              {course.description && (
                <p className="text-royal-gray leading-relaxed">
                  {course.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}