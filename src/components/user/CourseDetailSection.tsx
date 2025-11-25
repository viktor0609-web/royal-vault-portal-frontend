import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import { ArrowLeftIcon, EyeOffIcon, CheckCircleIcon, PlayIcon, ClockIcon, DownloadIcon, FileIcon, ExternalLinkIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { courseApi } from "@/lib/api";
import { sanitizeHtml } from "@/lib/htmlSanitizer";
import { useAuth } from "@/context/AuthContext";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

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

export function CourseDetailSection() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState(0);
  const [showMobileContent, setShowMobileContent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Initialize checkbox state from localStorage or default values
  const [completedItems, setCompletedItems] = useState<boolean[]>([]);

  // Fetch course data - OPTIMIZED
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        // Use 'full' fields for course detail page, with publicOnly=true to filter on backend
        const response = await courseApi.getCourseById(courseId, 'full', true);

        // Backend now filters displayOnPublicPage, so lectures are already filtered
        const courseData = response.data;
        setCourse(courseData);

        // Initialize completed items based on lecture completion status (only for authenticated users)
        if (user) {
          const lectures = courseData.lectures || [];
          const completed = lectures.map((lecture: Lecture) =>
            lecture.completedBy && Array.isArray(lecture.completedBy) && lecture.completedBy.some((id: string) => id === user._id)
          );
          setCompletedItems(completed);
        } else {
          // For non-authenticated users, initialize with all false
          const lectures = courseData.lectures || [];
          setCompletedItems(new Array(lectures.length).fill(false));
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user]);

  // Save to localStorage whenever completedItems changes (only for authenticated users)
  useEffect(() => {
    if (course && user) {
      localStorage.setItem(`courseDetailCompletedItems_${course._id}`, JSON.stringify(completedItems));
    }
  }, [completedItems, course, user]);

  const handleCheckboxClick = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!course || !course.lectures[index]) return;

    // Only allow completion tracking for authenticated users
    if (!user) {
      // Show a message or redirect to login
      alert('Please log in to track your progress');
      return;
    }

    const lecture = course.lectures[index];
    const isCurrentlyCompleted = completedItems[index];

    try {
      // Call API to toggle completion status
      const response = await courseApi.completeLecture(lecture._id);

      // Update local state based on API response
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

  // Handle file download
  const handleFileDownload = (file: { name: string; uploadedUrl: string }) => {
    if (file.uploadedUrl) {
      // Create a temporary link element to trigger download
      console.log(file.uploadedUrl);

      const link = document.createElement('a');
      link.href = file.uploadedUrl;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Get file icon based on file extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📋';
      case 'txt':
        return '📄';
      case 'zip':
      case 'rar':
        return '🗜️';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥';
      case 'mp3':
      case 'wav':
        return '🎵';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📎';
    }
  };

  // Check if lecture has no data (no video, no content, no files)
  const hasNoData = (lecture: Lecture | undefined) => {
    if (!lecture) return true;
    const hasVideo = !!lecture.videoUrl;
    const hasContent = !!lecture.content && lecture.content.trim().length > 0;
    const hasFiles = !!lecture.relatedFiles && lecture.relatedFiles.length > 0;
    return !hasVideo && !hasContent && !hasFiles;
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
      <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
        <Loading message="Loading course details..." fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
        <div className="text-center py-4 sm:py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => navigate('/courses')} variant="outline">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
        <div className="text-center py-4 sm:py-8">
          <h2 className="text-lg sm:text-xl font-semibold text-royal-dark-gray mb-2">Course Not Found</h2>
          <p className="text-sm sm:text-base text-royal-gray mb-3 sm:mb-4">The requested course could not be found.</p>
          <Button onClick={() => navigate('/courses')} variant="outline" className="text-xs sm:text-sm">
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
        <div className="text-center py-6 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📚</div>
          <h3 className="text-lg sm:text-xl font-semibold text-royal-dark-gray mb-2">No Lectures Available</h3>
          <p className="text-sm sm:text-base text-royal-gray mb-3 sm:mb-4">This course doesn't have any lectures yet.</p>
          <Button onClick={() => navigate(`/course-groups/${course.courseGroup._id}`)} variant="outline" className="text-xs sm:text-sm">
            Back to Course Group
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .lecture-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif !important;
          line-height: 1.4 !important;
          color: #374151 !important;
        }
        
        .lecture-content * {
          box-sizing: border-box !important;
        }
        
        .lecture-content h1 {
          font-size: 1.875rem !important; /* 30px */
          font-weight: 700 !important;
          color: #1f2937 !important; /* royal-dark-gray */
          margin-bottom: 1rem !important;
          margin-top: 1.5rem !important;
          line-height: 1.2 !important;
        }
        .lecture-content h2 {
          font-size: 1.5rem !important; /* 24px */
          font-weight: 600 !important;
          color: #1f2937 !important; /* royal-dark-gray */
          margin-bottom: 0.75rem !important;
          margin-top: 1.25rem !important;
          line-height: 1.3 !important;
        }
        .lecture-content h3 {
          font-size: 1.25rem !important; /* 20px */
          font-weight: 600 !important;
          color: #1f2937 !important; /* royal-dark-gray */
          margin-bottom: 0.5rem !important;
          margin-top: 1rem !important;
          line-height: 1.4 !important;
        }
        .lecture-content h4 {
          font-size: 1.125rem !important; /* 18px */
          font-weight: 600 !important;
          color: #1f2937 !important; /* royal-dark-gray */
          margin-bottom: 0.5rem !important;
          margin-top: 0.75rem !important;
          line-height: 1.4 !important;
        }
        .lecture-content h5 {
          font-size: 1rem !important; /* 16px */
          font-weight: 600 !important;
          color: #1f2937 !important; /* royal-dark-gray */
          margin-bottom: 0.5rem !important;
          margin-top: 0.5rem !important;
          line-height: 1.5 !important;
        }
        .lecture-content h6 {
          font-size: 0.875rem !important; /* 14px */
          font-weight: 600 !important;
          color: #1f2937 !important; /* royal-dark-gray */
          margin-bottom: 0.5rem !important;
          margin-top: 0.5rem !important;
          line-height: 1.5 !important;
        }
        .lecture-content p {
          margin-bottom: 0.75rem !important;
          line-height: 1.4 !important;
          color: #374151 !important;
        }
        .lecture-content a {
          color: #3b82f6 !important; /* royal-blue */
          text-decoration: none !important;
          transition: color 0.2s ease !important;
        }
        .lecture-content a:hover {
          text-decoration: underline !important;
          color: #1d4ed8 !important;
        }
        .lecture-content strong, .lecture-content b {
          font-weight: 600 !important;
          color: #1f2937 !important; /* royal-dark-gray */
        }
        .lecture-content em, .lecture-content i {
          font-style: italic !important;
          color: #4b5563 !important;
        }
        .lecture-content code {
          background-color: #f3f4f6 !important;
          padding: 0.125rem 0.25rem !important;
          border-radius: 0.25rem !important;
          font-size: 0.875rem !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
          color: #e11d48 !important;
        }
        .lecture-content pre {
          background-color: #f9fafb !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          padding: 1rem !important;
          overflow-x: auto !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
          font-size: 0.875rem !important;
          line-height: 1.5 !important;
        }
        .lecture-content pre code {
          background: none !important;
          padding: 0 !important;
          color: #374151 !important;
        }
        .lecture-content blockquote {
          border-left: 4px solid #3b82f6 !important;
          background-color: #eff6ff !important;
          padding: 0.75rem 1rem !important;
          margin: 1rem 0 !important;
          border-radius: 0 0.375rem 0.375rem 0 !important;
          font-style: italic !important;
        }
        .lecture-content ul, .lecture-content ol {
          margin: 0.75rem 0 !important;
          padding-left: 1.5rem !important;
        }
        .lecture-content li {
          margin: 0.25rem 0 !important;
          line-height: 1.4 !important;
        }
        .lecture-content ul li {
          list-style-type: disc !important;
        }
        .lecture-content ol li {
          list-style-type: decimal !important;
        }
        .lecture-content table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 1rem 0 !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          overflow: hidden !important;
        }
        .lecture-content th, .lecture-content td {
          padding: 0.75rem !important;
          text-align: left !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
        .lecture-content th {
          background-color: #f9fafb !important;
          font-weight: 600 !important;
          color: #1f2937 !important;
        }
        .lecture-content tr:last-child td {
          border-bottom: none !important;
        }
        .lecture-content img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 0.375rem !important;
          margin: 0.5rem 0 !important;
        }
        .lecture-content hr {
          border: none !important;
          border-top: 1px solid #e5e7eb !important;
          margin: 1.5rem 0 !important;
        }
        .lecture-content mark {
          background-color: #fef3c7 !important;
          padding: 0.125rem 0.25rem !important;
          border-radius: 0.25rem !important;
        }
        .lecture-content del {
          text-decoration: line-through !important;
          color: #9ca3af !important;
        }
        .lecture-content ins {
          text-decoration: underline !important;
          color: #059669 !important;
        }
      `}</style>
      <div className="p-2 sm:p-4 animate-in fade-in duration-100">
        {/* Header - Desktop only */}
        <div className="hidden min-[1024px]:flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-full flex items-center justify-between bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <PlayIcon className="h-4 w-4 sm:h-6 sm:w-6 text-royal-gray flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2 truncate">{course.title}</h1>
                <p className="text-xs sm:text-base text-royal-gray line-clamp-2">
                  {course.description}
                </p>
              </div>
            </div>
            <div
              className="cursor-pointer p-1.5 sm:p-2 rounded-lg hover:bg-royal-blue/5 transition-all duration-75 hover:scale-102 flex-shrink-0"
              onClick={() => navigate(`/course-groups/${course.courseGroup._id}`)}
              title="Back to Course Group"
            >
              <ArrowLeftIcon className="h-4 w-4 sm:h-6 sm:w-6 text-royal-gray hover:text-royal-blue transition-colors duration-75" />
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
                  <div className="w-full flex items-center justify-between p-2 sm:p-4 bg-white rounded-lg border border-royal-light-gray mb-3 sm:mb-6">
                    <h1 className="text-sm sm:text-lg font-bold text-royal-dark-gray line-clamp-1 min-w-0 flex-1 mr-2">
                      {lectures[currentItem]?.title || 'No lecture selected'}
                    </h1>
                    {/* Completion Status Checkbox */}
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-75 flex-shrink-0 ${user ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                        } ${completedItems[currentItem]
                          ? "bg-primary border-primary"
                          : "border-royal-light-gray"
                        }`}
                      onClick={(e) => handleCheckboxClick(currentItem, e)}
                      title={user ? 'Mark as complete' : 'Login required to track progress'}
                    >
                      {completedItems[currentItem] && <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white transition-transform duration-75" />}
                    </div>
                  </div>

                  {/* Video Content */}
                  {lectures[currentItem]?.videoUrl ? (
                    <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96 mb-4">
                      <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
                        <VideoPlayer
                          videoUrl={lectures[currentItem]?.videoUrl}
                          className="w-full h-full"
                          onEnded={() => {
                            // Auto-mark as complete when video ends (only for authenticated users)
                            if (user && !completedItems[currentItem]) {
                              handleCheckboxClick(currentItem, {} as React.MouseEvent);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : hasNoData(lectures[currentItem]) ? (
                    <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96 mb-4">
                      <div className="text-center p-6">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-royal-gray text-sm sm:text-base">
                          No content available for this lecture.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Lecture Content */}
                  {lectures[currentItem]?.content && (
                    <div className="bg-white rounded-lg border p-3">
                      <div
                        className="lecture-content"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(lectures[currentItem].content) || '<p class="text-gray-500 italic">No content available for this lecture.</p>'
                        }}
                      />
                    </div>
                  )}

                  {/* Related Files Section */}
                  {lectures[currentItem]?.relatedFiles && lectures[currentItem].relatedFiles.length > 0 && (
                    <div className="bg-white rounded-lg border border-royal-light-gray p-3 sm:p-4">
                      <h3 className="text-sm sm:text-lg font-semibold text-royal-dark-gray mb-2 sm:mb-3 flex items-center gap-2">
                        <FileIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        Related Files
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {lectures[currentItem].relatedFiles.map((file, fileIndex) => (
                          <div
                            key={fileIndex}
                            className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <span className="text-lg sm:text-2xl flex-shrink-0">
                                {getFileIcon(file.name)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-royal-dark-gray truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-royal-gray">
                                  Uploaded file
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFileDownload(file)}
                              className="flex-shrink-0 ml-2 text-xs sm:text-sm"
                            >
                              <DownloadIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden sm:inline">Download</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-75 flex-shrink-0 ${user ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                              } ${completedItems[index]
                                ? "bg-primary border-primary "
                                : "border-royal-light-gray "
                              }`}
                            onClick={(e) => handleCheckboxClick(index, e)}
                            title={user ? 'Mark as complete' : 'Login required to track progress'}
                          >
                            {completedItems[index] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-75 " />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`font-medium transition-colors duration-75  ${index === currentItem
                              ? "text-primary font-semibold"
                              : "text-royal-dark-gray"
                              }`}>
                              {lecture.title}
                            </span>
                            <div className="flex items-center gap-3 mt-1">
                              {lecture.content && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-royal-gray">📄</span>
                                  <span className="text-xs text-royal-gray">Content</span>
                                </div>
                              )}
                              {lecture.relatedFiles && lecture.relatedFiles.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <FileIcon className="h-3 w-3 text-royal-gray" />
                                  <span className="text-xs text-royal-gray">
                                    {lecture.relatedFiles.length} file{lecture.relatedFiles.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
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
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-75 flex-shrink-0 ${user ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                              } ${completedItems[index]
                                ? "bg-primary border-primary "
                                : "border-royal-light-gray "
                              }`}
                            onClick={(e) => handleCheckboxClick(index, e)}
                            title={user ? 'Mark as complete' : 'Login required to track progress'}
                          >
                            {completedItems[index] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-75 " />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`font-medium transition-colors duration-75  ${index === currentItem
                              ? "text-primary font-semibold"
                              : "text-royal-dark-gray"
                              }`}>
                              {lecture.title}
                            </span>
                            <div className="flex items-center gap-3 mt-1">
                              {lecture.content && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-royal-gray">📄</span>
                                  <span className="text-xs text-royal-gray">Content</span>
                                </div>
                              )}
                              {lecture.relatedFiles && lecture.relatedFiles.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <FileIcon className="h-3 w-3 text-royal-gray" />
                                  <span className="text-xs text-royal-gray">
                                    {lecture.relatedFiles.length} file{lecture.relatedFiles.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
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
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-75 flex-shrink-0 ${user ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                      } ${completedItems[currentItem]
                        ? "bg-primary border-primary"
                        : "border-royal-light-gray"
                      }`}
                    onClick={(e) => handleCheckboxClick(currentItem, e)}
                    title={user ? 'Mark as complete' : 'Login required to track progress'}
                  >
                    {completedItems[currentItem] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-75" />}
                  </div>
                </div>

                {/* Video Content */}
                {lectures[currentItem]?.videoUrl ? (
                  <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96 mb-6">
                    <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
                      <VideoPlayer
                        videoUrl={lectures[currentItem]?.videoUrl}
                        className="w-full h-full"
                        onEnded={() => {
                          // Auto-mark as complete when video ends (only for authenticated users)
                          if (user && !completedItems[currentItem]) {
                            handleCheckboxClick(currentItem, {} as React.MouseEvent);
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : hasNoData(lectures[currentItem]) ? (
                  <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96 mb-6">
                    <div className="text-center p-6">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-royal-gray text-sm sm:text-base">
                        No content available for this lecture.
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Lecture Description */}
                {lectures[currentItem]?.description && (
                  <div className="bg-white rounded-lg border border-royal-light-gray p-6 mb-6">
                    <h3 className="text-lg font-semibold text-royal-dark-gray mb-4">Description</h3>
                    <p className="text-royal-gray text-sm leading-relaxed">
                      {lectures[currentItem].description}
                    </p>
                  </div>
                )}

                {lectures[currentItem]?.content && (
                  <div className="bg-white rounded-lg border p-3">
                    <div
                      className="lecture-content"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(lectures[currentItem].content) || '<p class="text-gray-500 italic">No content available for this lecture.</p>'
                      }}
                    />
                  </div>
                )}

                {/* Related Files Section */}
                {lectures[currentItem]?.relatedFiles && lectures[currentItem].relatedFiles.length > 0 && (
                  <div className="bg-white rounded-lg border border-royal-light-gray p-6">
                    <h3 className="text-lg font-semibold text-royal-dark-gray mb-4 flex items-center gap-2">
                      <FileIcon className="h-5 w-5" />
                      Related Files
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lectures[currentItem].relatedFiles.map((file, fileIndex) => (
                        <div
                          key={fileIndex}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-2xl flex-shrink-0">
                              {getFileIcon(file.name)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-royal-dark-gray truncate group-hover:text-royal-blue transition-colors">
                                {file.name}
                              </p>
                              <p className="text-xs text-royal-gray">
                                Uploaded file
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFileDownload(file)}
                            className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <DownloadIcon className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">{file.name.split('.').pop()?.toUpperCase().includes('PDF') ? 'View' : 'Download'}</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}