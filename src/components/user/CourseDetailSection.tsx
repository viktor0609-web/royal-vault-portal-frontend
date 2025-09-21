import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EyeOffIcon, CheckCircleIcon, PlayIcon, ClockIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { courseApi } from "@/lib/api";

interface Course {
  _id: string;
  title: string;
  description: string;
  courseGroup: {
    _id: string;
    title: string;
    description: string;
    icon: string;
  };
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
  videoFile?: string;
  relatedFiles: {
    name: string;
    url: string;
    uploadedUrl: string;
  }[];
  completedBy: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function CourseDetailSection() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState(0);
  const [showMobileContent, setShowMobileContent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Initialize checkbox state from localStorage or default values
  const [completedItems, setCompletedItems] = useState<boolean[]>([]);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const response = await courseApi.getCourseById(courseId);
        setCourse(response.data);

        // Initialize completed items based on lecture completion status
        const lectures = response.data.lectures || [];
        const completed = lectures.map((lecture: Lecture) =>
          lecture.completedBy && lecture.completedBy.length > 0
        );
        setCompletedItems(completed);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Save to localStorage whenever completedItems changes
  useEffect(() => {
    if (course) {
      localStorage.setItem(`courseDetailCompletedItems_${course._id}`, JSON.stringify(completedItems));
    }
  }, [completedItems, course]);

  const handleCheckboxClick = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!course || !course.lectures[index]) return;

    const lecture = course.lectures[index];
    const isCurrentlyCompleted = completedItems[index];

    try {
      if (!isCurrentlyCompleted) {
        // Mark as completed
        await courseApi.completeLecture(lecture._id);
      }

      setCompletedItems(prev =>
        prev.map((completed, i) => i === index ? !completed : completed)
      );
    } catch (err) {
      console.error('Error updating lecture completion:', err);
      // You might want to show a toast notification here
    }
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
    if (!video || !course) return;

    const handleEnded = async () => {
      const lecture = course.lectures[currentItem];
      if (!lecture) return;

      try {
        await courseApi.completeLecture(lecture._id);
        setCompletedItems(prev =>
          prev.map((completed, i) => i === currentItem ? true : completed)
        );
      } catch (err) {
        console.error('Error marking lecture as completed:', err);
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentItem, course]);

  if (loading) {
    return (
      <div className="p-2 sm:p-4 animate-in fade-in duration-100">
        <div className="text-center py-8">Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 sm:p-4 animate-in fade-in duration-100">
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-2 sm:p-4 animate-in fade-in duration-100">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-royal-dark-gray mb-2">Course Not Found</h2>
          <p className="text-royal-gray mb-4">The requested course could not be found.</p>
          <Button onClick={() => navigate('/courses')} variant="outline">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const lectures = course.lectures || [];

  if (lectures.length === 0) {
    return (
      <div className="p-2 sm:p-4 animate-in fade-in duration-100">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-royal-dark-gray mb-2">No Lectures Available</h3>
          <p className="text-royal-gray mb-4">This course doesn't have any lectures yet.</p>
          <Button onClick={() => navigate(`/course-groups/${course.courseGroup._id}`)} variant="outline">
            Back to Course Group
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 animate-in fade-in duration-100">
      {/* Header - Desktop only */}
      <div className="hidden min-[1024px]:flex items-center gap-4 mb-6">
        <div className="w-full flex items-center justify-between bg-white p-6 rounded-lg border border-royal-light-gray">
          <div className="flex items-center gap-4">
            <PlayIcon className="h-6 w-6 text-royal-gray" />
            <div>
              <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">{course.title}</h1>
              <p className="text-royal-gray">
                {course.description}
              </p>
            </div>
          </div>
          <div
            className="cursor-pointer p-2 rounded-lg hover:bg-royal-blue/5 transition-all duration-75 hover:scale-102"
            onClick={() => navigate(`/course-groups/${course.courseGroup._id}`)}
            title="Back to Course Group"
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
                    {lectures[currentItem]?.title || 'No lecture selected'}
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
                    {lectures[currentItem]?.videoUrl || lectures[currentItem]?.videoFile ? (
                      <video
                        ref={videoRef}
                        src={lectures[currentItem]?.videoUrl || lectures[currentItem]?.videoFile}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <PlayIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No video available for this lecture</p>
                        </div>
                      </div>
                    )}
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
                  <h3 className="font-semibold text-royal-dark-gray">{course.title}</h3>
                </div>
                <div className="space-y-2 sm:space-y-4">
                  {lectures.map((lecture, index) => (
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
                          {lecture.title}
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
                <h3 className="font-semibold text-royal-dark-gray mb-2 sm:mb-4">{course.title}</h3>
                <div className="space-y-2 sm:space-y-4">
                  {lectures.map((lecture, index) => (
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
                          {lecture.title}
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
                  {lectures[currentItem]?.title || 'No lecture selected'}
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
                  {lectures[currentItem]?.videoUrl || lectures[currentItem]?.videoFile ? (
                    <video
                      ref={videoRef}
                      src={lectures[currentItem]?.videoUrl || lectures[currentItem]?.videoFile}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <PlayIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No video available for this lecture</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}