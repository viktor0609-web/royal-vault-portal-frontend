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
  ebookName?: string;
  ebookUrl?: string;
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
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const mobileContentScrollRef = useRef<HTMLDivElement>(null);
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
    // Scroll content to top when lecture changes
    if (contentScrollRef.current && window.innerWidth >= 1024) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (mobileContentScrollRef.current && window.innerWidth < 1024) {
      mobileContentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll to top when currentItem changes
  useEffect(() => {
    if (contentScrollRef.current && window.innerWidth >= 1024) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (mobileContentScrollRef.current && window.innerWidth < 1024 && showMobileContent) {
      mobileContentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentItem, showMobileContent]);

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
      <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in duration-100 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        {/* Header - Desktop only - Sticky */}
        <div className="hidden min-[1024px]:flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="sticky top-[41px] z-30 w-full flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-200/50 shadow-lg shadow-gray-900/5">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 truncate">{course.title}</h1>
                <p className="text-sm sm:text-base text-gray-600 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>
            <div
              className="cursor-pointer p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 flex-shrink-0 group"
              onClick={() => navigate(`/course-groups/${course.courseGroup._id}`)}
              title="Back to Course Group"
            >
              <ArrowLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-primary transition-colors duration-200" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex min-h-0">
          {/* Mobile: Show only list or only content */}
          {window.innerWidth < 1024 ? (
            showMobileContent ? (
              /* Mobile Content View */
              <div ref={mobileContentScrollRef} className="flex-1 flex flex-col w-full overflow-y-auto">
                {/* Back Button and Mobile Fullscreen - Integrated */}
                <div className="mb-6 flex justify-between items-center">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-primary cursor-pointer transition-all duration-200 hover:bg-gray-100 rounded-lg font-medium"
                    onClick={handleBackToList}
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Back to List</span>
                  </div>
                </div>

                {/* Content Area - Unified Panel */}
                <div className="flex-1 flex flex-col">
                  {/* Unified Content Panel - Like a PDF document */}
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                      <h1 className="text-lg sm:text-xl font-bold text-gray-900 min-w-0 flex-1 mr-4 leading-snug pr-4">
                        {lectures[currentItem]?.title || 'No lecture selected'}
                      </h1>
                      {/* Completion Status Checkbox */}
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 shadow-sm ${user ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'
                          } ${completedItems[currentItem]
                            ? "bg-primary border-primary shadow-md"
                            : "border-gray-300 hover:border-primary/50"
                          }`}
                        onClick={(e) => handleCheckboxClick(currentItem, e)}
                        title={user ? 'Mark as complete' : 'Login required to track progress'}
                      >
                        {completedItems[currentItem] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-200" />}
                      </div>
                    </div>

                    {/* Video Content */}
                    {lectures[currentItem]?.videoUrl ? (
                      <div className="w-full bg-black">
                        <div className="w-full aspect-video bg-black">
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
                      <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-96">
                        <div className="text-center p-8">
                          <div className="text-5xl mb-4">📭</div>
                          <p className="text-gray-500 text-base font-medium">
                            No content available for this lecture.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Lecture Content */}
                    {lectures[currentItem]?.content && (
                      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
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
                      <div className="px-4 sm:px-6 py-4 sm:py-5">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2.5">
                          <div className="p-1.5 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileIcon className="h-4 w-4 text-primary" />
                          </div>
                          Related Files
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {lectures[currentItem].relatedFiles.map((file, fileIndex) => (
                            <div
                              key={fileIndex}
                              className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 transition-all duration-200 group rounded-lg"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 bg-white rounded-lg flex-shrink-0 flex items-center justify-center w-10 h-10">
                                  <span className="text-lg block">
                                    {getFileIcon(file.name)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Uploaded file
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFileDownload(file)}
                                className="flex-shrink-0 ml-2 h-8 px-3 text-xs hover:bg-primary hover:text-white transition-all duration-200"
                              >
                                <DownloadIcon className="h-3.5 w-3.5 mr-1.5" />
                                <span className="hidden sm:inline">Download</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Mobile List View */
              <div className="w-full">
                {/* Back Button */}
                <div className="mb-6">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-primary cursor-pointer transition-all duration-200 hover:bg-gray-100 rounded-lg font-medium"
                    onClick={() => navigate('/courses', { state: { fromDetail: true } })}
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Back to Courses</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                  </div>
                  <div>
                    {lectures.map((lecture, index) => (
                      <div
                        key={index}
                        className={`w-full flex items-center p-3.5 transition-all duration-200 ease-in-out cursor-pointer group ${index === currentItem
                          ? "bg-primary/10"
                          : "hover:bg-gray-50"
                          } ${index < lectures.length - 1 ? "border-b border-gray-200" : ""}`}
                        onClick={() => handleItemClick(index)}
                      >
                        <div className="flex items-center gap-3.5 w-full">
                          <div
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${user ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'
                              } ${completedItems[index]
                                ? "bg-primary border-primary"
                                : "border-gray-300 group-hover:border-primary/50"
                              }`}
                            onClick={(e) => handleCheckboxClick(index, e)}
                            title={user ? 'Mark as complete' : 'Login required to track progress'}
                          >
                            {completedItems[index] && <CheckCircleIcon className="h-3.5 w-3.5 text-white transition-transform duration-200" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`font-semibold transition-colors duration-200 block text-sm leading-snug ${index === currentItem
                              ? "text-primary"
                              : "text-gray-900 group-hover:text-primary"
                              }`}>
                              {lecture.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1.5">
                              {lecture.content && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md">
                                  <span className="text-xs leading-none">📄</span>
                                  <span className="text-xs text-gray-600 font-medium leading-tight">Content</span>
                                </div>
                              )}
                              {lecture.relatedFiles && lecture.relatedFiles.length > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md">
                                  <FileIcon className="h-3 w-3 text-gray-600" />
                                  <span className="text-xs text-gray-600 font-medium leading-tight">
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

                  {/* Ebook Download Button */}
                  {course?.ebookUrl && course?.ebookName && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = course.ebookUrl!;
                          link.download = course.ebookName || 'ebook';
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-sm font-medium flex items-center gap-2 px-4"
                      >
                        <DownloadIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate min-w-0 flex-1">Download {course.ebookName}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            /* Desktop: Show both list and content */
            <>
              {/* Main Content - Unified Panel */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Unified Content Panel - Like a PDF document */}
                <div ref={contentScrollRef} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-y-auto overflow-x-hidden flex flex-col max-h-[calc(100vh-120px)]">
                  {/* Header */}
                  <div className="w-full flex items-center justify-between px-6 py-5 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900 leading-snug pr-4 flex-1 min-w-0">
                      {lectures[currentItem]?.title || 'No lecture selected'}
                    </h1>
                    {/* Completion Status Checkbox */}
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 shadow-sm ${user ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'
                        } ${completedItems[currentItem]
                          ? "bg-primary border-primary shadow-md"
                          : "border-gray-300 hover:border-primary/50"
                        }`}
                      onClick={(e) => handleCheckboxClick(currentItem, e)}
                      title={user ? 'Mark as complete' : 'Login required to track progress'}
                    >
                      {completedItems[currentItem] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-200" />}
                    </div>
                  </div>

                  {/* Video Content */}
                  {lectures[currentItem]?.videoUrl ? (
                    <div className="w-full bg-black">
                      <div className="w-full aspect-video bg-black">
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
                    <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-96">
                      <div className="text-center p-8">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-gray-500 text-base font-medium">
                          No content available for this lecture.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Lecture Description */}
                  {lectures[currentItem]?.description && (
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-primary rounded-full"></div>
                        Description
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {lectures[currentItem].description}
                      </p>
                    </div>
                  )}

                  {/* Lecture Content */}
                  {lectures[currentItem]?.content && (
                    <div className="px-6 py-5 border-b border-gray-200">
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
                    <div className="px-6 py-5">
                      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2.5">
                        <div className="p-1.5 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileIcon className="h-4 w-4 text-primary" />
                        </div>
                        Related Files
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {lectures[currentItem].relatedFiles.map((file, fileIndex) => (
                          <div
                            key={fileIndex}
                            className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 transition-all duration-200 group rounded-lg"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-white rounded-lg flex-shrink-0 flex items-center justify-center w-10 h-10">
                                <span className="text-lg block">
                                  {getFileIcon(file.name)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Uploaded file
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFileDownload(file)}
                              className="flex-shrink-0 ml-2 h-8 px-3 hover:bg-primary hover:text-white transition-all duration-200"
                            >
                              <DownloadIcon className="h-3.5 w-3.5 mr-1.5" />
                              <span className="hidden sm:inline text-xs">{file.name.split('.').pop()?.toUpperCase().includes('PDF') ? 'View' : 'Download'}</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {/* Right Sidebar - Curriculum */}
              <div className="w-80 bg-white/80 backdrop-blur-sm border-l border-gray-200 ml-6 rounded-r-xl shadow-sm flex flex-col min-h-0 max-h-[calc(100vh-120px)]">
                {/* Scrollable lecture list */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 pb-0">
                  <div>
                    {lectures.map((lecture, index) => (
                      <div
                        key={index}
                        className={`w-full flex items-center p-3.5 transition-all duration-200 ease-in-out cursor-pointer group ${index === currentItem
                          ? "bg-primary/10"
                          : "hover:bg-gray-50"
                          } ${index < lectures.length - 1 ? "border-b border-gray-200" : ""}`}
                        onClick={() => handleItemClick(index)}
                      >
                        <div className="flex items-center gap-3.5 w-full">
                          <div
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${user ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'
                              } ${completedItems[index]
                                ? "bg-primary border-primary"
                                : "border-gray-300 group-hover:border-primary/50"
                              }`}
                            onClick={(e) => handleCheckboxClick(index, e)}
                            title={user ? 'Mark as complete' : 'Login required to track progress'}
                          >
                            {completedItems[index] && <CheckCircleIcon className="h-3.5 w-3.5 text-white transition-transform duration-200" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`font-semibold transition-colors duration-200 block text-sm leading-snug ${index === currentItem
                              ? "text-primary"
                              : "text-gray-900 group-hover:text-primary"
                              }`}>
                              {lecture.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1.5">
                              {lecture.content && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md">
                                  <span className="text-xs leading-none">📄</span>
                                  <span className="text-xs text-gray-600 font-medium leading-tight">Content</span>
                                </div>
                              )}
                              {lecture.relatedFiles && lecture.relatedFiles.length > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md">
                                  <FileIcon className="h-3 w-3 text-gray-600" />
                                  <span className="text-xs text-gray-600 font-medium leading-tight">
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

                {/* Sticky Download Button */}
                {course?.ebookUrl && course?.ebookName && (
                  <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-5 mt-auto">
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = course.ebookUrl!;
                        link.download = course.ebookName || 'ebook';
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-sm font-medium flex items-center gap-2 px-4"
                    >
                      <DownloadIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate min-w-0 flex-1">Download {course.ebookName}</span>
                    </Button>
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