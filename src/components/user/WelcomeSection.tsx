import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircleIcon, FileTextIcon, MessageCircleIcon, VideoIcon, PlayIcon, ArrowRightIcon, XIcon } from "lucide-react";
import { useAuthDialog } from "@/context/AuthDialogContext";

const welcomeItems = [
  {
    title: "Set your password",
    action: "Create Account",
    completed: true,
  },
  {
    title: "Get tax, legal, & investing resources",
    action: "Open Resources",
    completed: false,
  },
  {
    title: "Join a live webinar",
    action: "Open Webinars",
    completed: false,
  },
  {
    title: "Watch the overview video",
    action: "Open Video",
    completed: false,
  },
];

// Video URL - same as used in CourseDetailSection
const OVERVIEW_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

export function WelcomeSection() {
  const navigate = useNavigate();
  const { openDialog } = useAuthDialog();

  // Initialize state from localStorage or default values
  const [completedItems, setCompletedItems] = useState<boolean[]>(() => {
    const saved = localStorage.getItem('welcomeCompletedItems');
    return saved ? JSON.parse(saved) : [true, false, false, false];
  });

  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Save to localStorage whenever completedItems changes
  useEffect(() => {
    localStorage.setItem('welcomeCompletedItems', JSON.stringify(completedItems));
  }, [completedItems]);

  const handleAction = (action: string, index: number) => {
    // Mark the item as completed when clicked
    setCompletedItems(prev =>
      prev.map((completed, i) => i === index ? true : completed)
    );

    if (action === "Create Account") {
      openDialog('signup');
    } else if (action == "Open Resources") {
      navigate('/courses');
    } else if (action == "Open Webinars") {
      navigate('/royal-tv')
    } else if (action == "Open Video") {
      setShowVideoModal(true);
    }
  };

  const handleCheckboxClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent div's onClick
    setCompletedItems(prev =>
      prev.map((completed, i) => i === index ? !completed : completed)
    );
  };

  return (
    <div className="flex-1 p-2 sm:p-2 animate-in fade-in duration-300">
      <div className="flex gap-2 sm:gap-4 items-center bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-4 sm:mb-8">
        <HandIcon className="hidden sm:block h-12 w-12 text-royal-gray" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2">WELCOME</h1>

          <p className="text-royal-gray">
            Join thousands of investors nationwide and access free live coaching, video training, chats, & more.
          </p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        {welcomeItems.map((item, index) => (
          <div
            key={index}
            className="w-full flex items-center justify-between p-2 sm:p-4 bg-white rounded-lg border border-royal-light-gray 
                     hover:shadow-md hover:scale-[1.01] hover:border-royal-blue/10 
                     transition-all duration-200 ease-in-out cursor-pointer group"
            onClick={() => handleAction(item.action, index)}
          >
            <div className="flex items-center gap-2 sm:gap-4">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 group-hover:scale-105 flex-shrink-0 cursor-pointer ${completedItems[index]
                  ? "bg-primary border-primary group-hover:bg-royal-blue-dark group-hover:border-royal-blue-dark"
                  : "border-royal-light-gray group-hover:border-royal-blue/30"
                  }`}
                onClick={(e) => handleCheckboxClick(index, e)}
              >
                {completedItems[index] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-200 group-hover:scale-105" />}
              </div>
              <span className="text-royal-dark-gray font-medium transition-colors duration-200 group-hover:text-royal-blue">{item.title}</span>
            </div>
            {/* Desktop Button */}
            <Button
              onClick={() => handleAction(item.action, index)}
              className="hidden sm:flex bg-primary hover:bg-royal-blue-dark text-white px-6 transition-all duration-200 
                       group-hover:scale-102 group-hover:shadow-sm"
            >
              {item.action}
            </Button>

            {/* Mobile Arrow Button */}
            <Button
              onClick={() => handleAction(item.action, index)}
              className="sm:hidden bg-primary hover:bg-royal-blue-dark text-white p-2 rounded-full transition-all duration-200 
                       group-hover:scale-102 group-hover:shadow-sm"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <VideoIcon className="h-5 w-5" />
              Overview Video
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={OVERVIEW_VIDEO_URL}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
                autoPlay={false}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Separate the HandIcon import
import { HandIcon } from "lucide-react";