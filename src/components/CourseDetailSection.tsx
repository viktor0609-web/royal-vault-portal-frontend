import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EyeOffIcon, PlayIcon, CheckCircleIcon } from "lucide-react";

const curriculumItems = [
  { title: "Watch The Video", completed: false, current: true },
  { title: "How to use a land trust?", completed: false, current: false },
  { title: "How do land trusts reduce lawsuit risk?", completed: false, current: false },
  { title: "What are the best practices around structuring entities with partners?", completed: false, current: false },
  { title: "Additional Resources", completed: false, current: false },
];

export function CourseDetailSection() {
  const [currentItem, setCurrentItem] = useState(0);

  const handleMarkComplete = () => {
    console.log("Marking item as complete");
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Curriculum */}
      <div className="w-80 bg-white border-r border-royal-light-gray p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" className="p-1">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <EyeOffIcon className="h-6 w-6 text-royal-gray" />
          <div>
            <h2 className="font-bold text-royal-dark-gray">Anonymity</h2>
            <p className="text-sm text-royal-gray">Make yourself invisible and prevent lawsuits before they begin.</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-royal-dark-gray mb-4">Land Trusts</h3>
          <div className="space-y-3">
            {curriculumItems.map((item, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  item.current 
                    ? "bg-royal-light-gray" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setCurrentItem(index)}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  item.completed 
                    ? "bg-primary border-primary" 
                    : "border-royal-light-gray"
                }`}>
                  {item.completed && <CheckCircleIcon className="h-3 w-3 text-white" />}
                </div>
                <span className={`text-sm ${
                  item.current 
                    ? "text-primary font-medium" 
                    : item.completed 
                      ? "text-royal-gray" 
                      : "text-royal-dark-gray"
                }`}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-royal-light-gray">
          <h1 className="text-2xl font-bold text-royal-dark-gray">Watch The Video</h1>
          <Button 
            onClick={handleMarkComplete}
            className="bg-primary hover:bg-royal-blue-dark text-white"
          >
            Mark As Complete
          </Button>
        </div>

        {/* Video Content */}
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                size="lg"
                className="bg-black/70 hover:bg-black/80 text-white rounded-full p-6"
              >
                <PlayIcon className="h-12 w-12 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}