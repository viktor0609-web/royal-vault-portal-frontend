import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  EyeOffIcon,
  NetworkIcon,
  RefreshCwIcon,
  KeyIcon,
  TruckIcon,
  GraduationCapIcon,
  ClockIcon,
  PlusIcon
} from "lucide-react";
import { GroupModal } from "./GroupModal";


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
  courses: any[];
}

// Mock data for course groups
const mockCourseGroups: CourseGroup[] = [
  {
    _id: "anonymity",
    title: "Anonymity",
    description: "Make yourself invisible and prevent lawsuits before they begin.",
    icon: "eye-off",
    createdBy: {
      _id: "admin",
      name: "Admin",
      email: "admin@royalvault.com"
    },
    courses: [
      {
        _id: "anon-1",
        title: "Digital Privacy Fundamentals",
        description: "Learn the basics of protecting your digital identity",
        duration: "2 hours",
        level: "Beginner"
      },
      {
        _id: "anon-2",
        title: "Advanced Anonymity Techniques",
        description: "Master advanced methods for complete anonymity",
        duration: "4 hours",
        level: "Advanced"
      },
      {
        _id: "anon-3",
        title: "Digital Privacy Fundamentals",
        description: "Learn the basics of protecting your digital identity",
        duration: "2 hours",
        level: "Beginner"
      },
      {
        _id: "anon-4",
        title: "Advanced Anonymity Techniques",
        description: "Master advanced methods for complete anonymity",
        duration: "4 hours",
        level: "Advanced"
      },
      {
        _id: "anon-5",
        title: "Digital Privacy Fundamentals",
        description: "Learn the basics of protecting your digital identity",
        duration: "2 hours",
        level: "Beginner"
      },
      {
        _id: "anon-6",
        title: "Advanced Anonymity Techniques",
        description: "Master advanced methods for complete anonymity",
        duration: "4 hours",
        level: "Advanced"
      }
    ]
  },
  {
    _id: "asset-holding",
    title: "Asset Holding",
    description: "Hold your assets anonymously and securely.",
    icon: "network",
    createdBy: {
      _id: "admin",
      name: "Admin",
      email: "admin@royalvault.com"
    },
    courses: [
      {
        _id: "asset-1",
        title: "Offshore Trusts 101",
        description: "Understanding offshore trust structures",
        duration: "3 hours",
        level: "Intermediate"
      },
      {
        _id: "asset-2",
        title: "Cryptocurrency Asset Protection",
        description: "Securing digital assets with proper structures",
        duration: "2.5 hours",
        level: "Intermediate"
      }
    ]
  },
  {
    _id: "operations",
    title: "Operations",
    description: "Run your business without liability.",
    icon: "refresh-cw",
    createdBy: {
      _id: "admin",
      name: "Admin",
      email: "admin@royalvault.com"
    },
    courses: [
      {
        _id: "ops-1",
        title: "Business Entity Selection",
        description: "Choose the right entity structure for your business",
        duration: "2 hours",
        level: "Beginner"
      },
      {
        _id: "ops-2",
        title: "Liability Protection Strategies",
        description: "Protect your personal assets from business liabilities",
        duration: "3.5 hours",
        level: "Advanced"
      }
    ]
  },
  {
    _id: "estate-planning",
    title: "Estate Planning",
    description: "Transfer your wealth to future generations.",
    icon: "key",
    createdBy: {
      _id: "admin",
      name: "Admin",
      email: "admin@royalvault.com"
    },
    courses: [
      {
        _id: "estate-1",
        title: "Wealth Transfer Strategies",
        description: "Effective methods for transferring wealth to heirs",
        duration: "4 hours",
        level: "Advanced"
      },
      {
        _id: "estate-2",
        title: "Trust Administration",
        description: "Managing and administering family trusts",
        duration: "3 hours",
        level: "Intermediate"
      }
    ]
  },
  {
    _id: "tax-vehicles",
    title: "Tax Vehicles",
    description: "Optimize your taxes for the first $150k annual revenue.",
    icon: "truck",
    createdBy: {
      _id: "admin",
      name: "Admin",
      email: "admin@royalvault.com"
    },
    courses: [
      {
        _id: "tax-1",
        title: "Tax Optimization Basics",
        description: "Fundamental tax reduction strategies",
        duration: "2.5 hours",
        level: "Beginner"
      },
      {
        _id: "tax-2",
        title: "Advanced Tax Structures",
        description: "Complex tax planning for high earners",
        duration: "5 hours",
        level: "Advanced"
      }
    ]
  },
  {
    _id: "royal-life-1",
    title: "Royal Life 1.0",
    description: "Learn how to achieve an extraordinary life on every level.",
    icon: "graduation-cap",
    createdBy: {
      _id: "admin",
      name: "Admin",
      email: "admin@royalvault.com"
    },
    courses: [
      {
        _id: "royal-1",
        title: "Mindset Mastery",
        description: "Develop the mindset of extraordinary success",
        duration: "6 hours",
        level: "All Levels"
      },
      {
        _id: "royal-2",
        title: "Lifestyle Design",
        description: "Design and live your ideal lifestyle",
        duration: "4 hours",
        level: "Intermediate"
      }
    ]
  },
  {
    _id: "royal-life-2",
    title: "Royal Life 2.0",
    description: "Advanced strategies for achieving the royal lifestyle.",
    icon: "graduation-cap",
    createdBy: {
      _id: "admin",
      name: "Admin",
      email: "admin@royalvault.com"
    },
    courses: [
      {
        _id: "royal2-1",
        title: "Wealth Building Mastery",
        description: "Advanced wealth accumulation strategies",
        duration: "8 hours",
        level: "Advanced"
      }
    ]
  },
  {
    _id: "coming-soon",
    title: "Coming Soon",
    description: "Exciting new courses are being developed.",
    icon: "clock",
    createdBy: {
      _id: "admin",
      name: "Admin",
      email: "admin@royalvault.com"
    },
    courses: []
  }
];

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CourseGroup | null>(null);

  const handleAddCourseGroup = () => {
    setEditingGroup(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleGroupSaved = (groupData?: CourseGroup, isUpdate?: boolean) => {
    if (groupData) {
      if (isUpdate) {
        setCourseGroups(prev =>
          prev.map(group => group._id === groupData._id ? groupData : group)
        );
      } else {
        setCourseGroups(prev => [...prev, groupData]);
      }
    }
  };

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      setCourseGroups(mockCourseGroups);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Use mock course groups and map them to display categories
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
        <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
          <div className="flex items-center gap-4">
            <GraduationCapIcon className="h-12 w-12 text-royal-gray" />
            <div>
              <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">COURSES</h1>
              <p className="text-royal-gray">
                Learn everything you need to know to optimize your asset protection and tax structure.
              </p>
            </div>
          </div>
          <button
            onClick={handleAddCourseGroup}
            className="flex items-center gap-2 px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue/90 transition-colors font-medium"
          >
            <PlusIcon className="h-4 w-4" />
            Add Course Group
          </button>
        </div>
        <div className="text-center py-8">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
          <div className="flex items-center gap-4">
            <GraduationCapIcon className="h-12 w-12 text-royal-gray" />
            <div>
              <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">COURSES</h1>
              <p className="text-royal-gray">
                Learn everything you need to know to optimize your asset protection and tax structure.
              </p>
            </div>
          </div>
          <button
            onClick={handleAddCourseGroup}
            className="flex items-center gap-2 px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue/90 transition-colors font-medium"
          >
            <PlusIcon className="h-4 w-4" />
            Add Course Group
          </button>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
        <div className="flex items-center gap-4">
          <GraduationCapIcon className="h-12 w-12 text-royal-gray" />
          <div>
            <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">COURSES</h1>
            <p className="text-royal-gray">
              Learn everything you need to know to optimize your asset protection and tax structure.
            </p>
          </div>
        </div>
        <button
          onClick={handleAddCourseGroup}
          className="flex items-center gap-2 px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue/90 transition-colors font-medium"
        >
          <PlusIcon className="h-4 w-4" />
          Add Course Group
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-6 mb-12">
        {displayCategories.map((category, index) => (
          <Link
            key={category.id}
            to={`/admin/courses/group/${category.id}`}
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

      <GroupModal
        isOpen={isModalOpen}
        closeDialog={handleCloseModal}
        editingGroup={editingGroup}
        onGroupSaved={handleGroupSaved}
      />
    </div>
  );
}