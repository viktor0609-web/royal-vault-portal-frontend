import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EyeOffIcon, CheckCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const curriculumItems = [
  {
    title: "Watch The Video",
    completed: false,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "0:10"
  },
  {
    title: "How to use a land trust?",
    completed: false,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "0:15"
  },
  {
    title: "How do land trusts reduce lawsuit risk?",
    completed: false,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "0:20"
  },
  {
    title: "What are the best practices around structuring entities with partners?",
    completed: false,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "0:25"
  },
  {
    title: "Additional Resources",
    completed: false,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "0:10"
  },
];

export function CourseDetailSection() {
  const [currentItem, setCurrentItem] = useState(0);
  const [showMobileContent, setShowMobileContent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Initialize checkbox state from localStorage or default values
  const [completedItems, setCompletedItems] = useState<boolean[]>(() => {
    const saved = localStorage.getItem('courseDetailCompletedItems');
    return saved ? JSON.parse(saved) : [false, false, false, false, false];
  });

  // Save to localStorage whenever completedItems changes
  useEffect(() => {
    localStorage.setItem('courseDetailCompletedItems', JSON.stringify(completedItems));
  }, [completedItems]);

  const handleCheckboxClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedItems(prev =>
      prev.map((completed, i) => i === index ? !completed : completed)
    );
  };


  const handleItemClick = (index: number) => {
    setCurrentItem(index);
    // On mobile, show content when item is clicked
    if (window.innerWidth < 1024) {
      setShowMobileContent(true);
    }
  };

  const handleBackToList = () => {
    setShowMobileContent(false);
  };



  // Auto-mark as complete when video ends
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setCompletedItems(prev =>
        prev.map((completed, i) => i === currentItem ? true : completed)
      );
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentItem]);

  return (
    <div className="p-2 sm:p-4 animate-in fade-in duration-100">
      {/* Header - Desktop only */}
      <div className="hidden min-[1024px]:flex items-center gap-4 mb-6">
        <div className="w-full flex items-center justify-between bg-white p-6 rounded-lg border border-royal-light-gray">
          <div className="flex items-center gap-4">
            <EyeOffIcon className="h-6 w-6 text-royal-gray" />
            <div>
              <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">Anonymity</h1>
              <p className="text-royal-gray">
                Make yourself invisible and prevent lawsuits before they begin.
              </p>
            </div>
          </div>
          <div
            className="cursor-pointer p-2 rounded-lg hover:bg-royal-blue/5 transition-all duration-75 hover:scale-102"
            onClick={() => navigate('/courses', { state: { fromDetail: true } })}
            title="Back to Courses"
          >
            <ArrowLeftIcon className="h-6 w-6 text-royal-gray hover:text-royal-blue transition-colors duration-75" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex">
        {/* Mobile: Show only list or only content */}
        {window.innerWidth < 1024 ? (
          showMobileContent ? (
            /* Mobile Content View */
            <div className="flex-1 flex flex-col w-full">
              {/* Back Button and Mobile Fullscreen - Integrated */}
              <div className="mb-4 flex justify-between items-center">
                <div
                  className="inline-flex items-center gap-2 px-3 py-2 text-royal-gray hover:text-royal-blue cursor-pointer transition-all duration-75 hover:bg-royal-blue/5 rounded-lg"
                  onClick={handleBackToList}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Back to List</span>
                </div>

              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="w-full flex items-center justify-between p-2 sm:p-4 bg-white rounded-lg border border-royal-light-gray mb-4 sm:mb-6">
                  <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray line-clamp-1">
                    {curriculumItems[currentItem].title}
                  </h1>
                  {/* Completion Status Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-75 cursor-pointer flex-shrink-0 ${completedItems[currentItem]
                      ? "bg-primary border-primary"
                      : "border-royal-light-gray"
                      }`}
                    onClick={(e) => handleCheckboxClick(currentItem, e)}
                  >
                    {completedItems[currentItem] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-75" />}
                  </div>
                </div>

                {/* Video Content */}
                <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96">
                  <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
                    {/* Video Element with Default Controls */}
                    <video
                      ref={videoRef}
                      src={curriculumItems[currentItem].videoUrl}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />

                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Mobile List View */
            <div className="w-full bg-white p-1">
              {/* Back Button */}
              <div className="mb-4">
                <div
                  className="inline-flex items-center gap-2 px-3 py-2 text-royal-gray hover:text-royal-blue cursor-pointer transition-all duration-75 hover:bg-royal-blue/5 rounded-lg"
                  onClick={() => navigate('/courses', { state: { fromDetail: true } })}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Back to Courses</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-royal-dark-gray">Land Trusts</h3>
                </div>
                <div className="space-y-2 sm:space-y-4">
                  {curriculumItems.map((item, index) => (
                    <div
                      key={index}
                      className={`w-full flex items-center p-2 sm:p-4 rounded-lg border transition-all duration-75 ease-in-out cursor-pointer group ${index === currentItem
                        ? "bg-primary/5 border-primary shadow-lg scale-[1.01] ring-2 ring-primary/30"
                        : "bg-white border-royal-light-gray"
                        }`}
                      onClick={() => handleItemClick(index)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-75  flex-shrink-0 cursor-pointer ${completedItems[index]
                            ? "bg-primary border-primary "
                            : "border-royal-light-gray "
                            }`}
                          onClick={(e) => handleCheckboxClick(index, e)}
                        >
                          {completedItems[index] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-75 " />}
                        </div>
                        <span className={`font-medium transition-colors duration-75  ${index === currentItem
                          ? "text-primary font-semibold"
                          : "text-royal-dark-gray"
                          }`}>
                          {item.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          /* Desktop: Show both list and content */
          <>
            {/* Left Sidebar - Curriculum */}
            <div className="w-80 bg-white border-r border-royal-light-gray p-6 mr-8">

              <div className="mb-6">
                <h3 className="font-semibold text-royal-dark-gray mb-2 sm:mb-4">Land Trusts</h3>
                <div className="space-y-2 sm:space-y-4">
                  {curriculumItems.map((item, index) => (
                    <div
                      key={index}
                      className={`w-full flex items-center p-2 sm:p-4 rounded-lg border transition-all duration-75 ease-in-out cursor-pointer group ${index === currentItem
                        ? "bg-primary/5 border-primary shadow-lg scale-[1.01] ring-2 ring-primary/30 min-[1024px]:bg-primary/10 min-[1024px]:shadow-xl min-[1024px]:scale-[1.015] min-[1024px]:ring-4 min-[1024px]:ring-primary/40"
                        : "bg-white border-royal-light-gray"
                        }`}
                      onClick={() => handleItemClick(index)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-75  flex-shrink-0 cursor-pointer ${completedItems[index]
                            ? "bg-primary border-primary "
                            : "border-royal-light-gray "
                            }`}
                          onClick={(e) => handleCheckboxClick(index, e)}
                        >
                          {completedItems[index] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-75 " />}
                        </div>
                        <span className={`font-medium transition-colors duration-75  ${index === currentItem
                          ? "text-primary font-semibold"
                          : "text-royal-dark-gray"
                          }`}>
                          {item.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="w-full flex items-center justify-between p-2 sm:p-4 bg-white rounded-lg border border-royal-light-gray mb-6">
                <h1 className="text-2xl font-bold text-royal-dark-gray line-clamp-1">
                  {curriculumItems[currentItem].title}
                </h1>
                {/* Completion Status Checkbox */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-75 cursor-pointer flex-shrink-0 ${completedItems[currentItem]
                    ? "bg-primary border-primary"
                    : "border-royal-light-gray"
                    }`}
                  onClick={(e) => handleCheckboxClick(currentItem, e)}
                >
                  {completedItems[currentItem] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-75" />}
                </div>
              </div>

              {/* Video Content */}
              <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96">
                <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
                  {/* Video Element with Default Controls */}
                  <video
                    ref={videoRef}
                    src={curriculumItems[currentItem].videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />

                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}