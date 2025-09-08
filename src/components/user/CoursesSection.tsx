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
    id: "anonymity",
  },
  {
    icon: NetworkIcon,
    title: "Asset Holding",
    description: "Hold your assets anonymously and securely.",
    id: "anonymity",
  },
  {
    icon: RefreshCwIcon,
    title: "Operations",
    description: "Run your business without liability.",
    id: "anonymity",
  },
  {
    icon: KeyIcon,
    title: "Estate Planning",
    description: "Transfer your wealth to future generations.",
    id: "anonymity",
  },
  {
    icon: TruckIcon,
    title: "Tax Vehicles",
    description: "Optimize your taxes for the first $150k annual revenue.",
    id: "anonymity",
  },
  {
    icon: GraduationCapIcon,
    title: "Royal Life 1.0",
    description: "Learn how to achieve an extraordinary life on every level.",
    id: "anonymity",
  },
  {
    icon: GraduationCapIcon,
    title: "Royal Life 2.0",
    description: "",
    id: "anonymity",
  },
  {
    icon: ClockIcon,
    title: "Coming Soon",
    description: "",
    id: "anonymity",
  },
];


export function CoursesSection() {
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
        {courseCategories.map((category, index) => (
          <Link
            key={index}
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