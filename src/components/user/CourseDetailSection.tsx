import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EyeOffIcon, CheckCircleIcon, PlayIcon, ClockIcon, DownloadIcon, FileIcon, ExternalLinkIcon } from "lucide-react";
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

  // Fetch course data - OPTIMIZED
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        // Use 'full' fields for course detail page to get all lecture data
        const response = await courseApi.getCourseById(courseId, 'full');
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
  const handleFileDownload = (file: { name: string; url: string; uploadedUrl: string }) => {
    const fileUrl = file.uploadedUrl || file.url;
    if (fileUrl) {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
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
    <>
      <style>{`
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
          line-height: 1.6 !important;
        }
        .lecture-content a {
          color: #3b82f6 !important; /* royal-blue */
          text-decoration: none !important;
        }
        .lecture-content a:hover {
          text-decoration: underline !important;
        }
        .lecture-content strong {
          font-weight: 600 !important;
          color: #1f2937 !important; /* royal-dark-gray */
        }
        .lecture-content code {
          background-color: #f3f4f6 !important;
          padding: 0.125rem 0.25rem !important;
          border-radius: 0.25rem !important;
          font-size: 0.875rem !important;
        }
        .lecture-content pre {
          background-color: #f9fafb !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          padding: 1rem !important;
          overflow-x: auto !important;
        }
        .lecture-content blockquote {
          border-left: 4px solid #3b82f6 !important;
          background-color: #eff6ff !important;
          padding: 0.5rem 1rem !important;
          margin: 1rem 0 !important;
        }
        .lecture-content ul, .lecture-content ol {
          margin: 0.75rem 0 !important;
          padding-left: 1.5rem !important;
        }
        .lecture-content li {
          margin: 0.25rem 0 !important;
        }
      `}</style>
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
                  <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96 mb-4">
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

                  {/* Lecture Description */}
                  {lectures[currentItem]?.description && (
                    <div className="bg-white rounded-lg border border-royal-light-gray p-4 mb-4">
                      <h3 className="text-lg font-semibold text-royal-dark-gray mb-3">Description</h3>
                      <p className="text-royal-gray text-sm leading-relaxed">
                        {lectures[currentItem].description}
                      </p>
                    </div>
                  )}

                  {/* Lecture Content */}
                  {lectures[currentItem]?.content && (
                    <div className="bg-white rounded-lg border border-royal-light-gray p-4 mb-4">
                      <div
                        className="lecture-content max-w-none text-royal-gray leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: lectures[currentItem].content }}
                        style={{
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}
                      />
                    </div>
                  )}

                  {/* Related Files Section */}
                  {lectures[currentItem]?.relatedFiles && lectures[currentItem].relatedFiles.length > 0 && (
                    <div className="bg-white rounded-lg border border-royal-light-gray p-4">
                      <h3 className="text-lg font-semibold text-royal-dark-gray mb-3 flex items-center gap-2">
                        <FileIcon className="h-5 w-5" />
                        Related Files
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {lectures[currentItem].relatedFiles.map((file, fileIndex) => (
                          <div
                            key={fileIndex}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-2xl flex-shrink-0">
                                {getFileIcon(file.name)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-royal-dark-gray truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-royal-gray">
                                  {(file.uploadedUrl ? 'Uploaded file' : 'External link')}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFileDownload(file)}
                              className="flex-shrink-0 ml-2"
                            >
                              <DownloadIcon className="h-4 w-4 mr-1" />
                              Download
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
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-75  flex-shrink-0 cursor-pointer ${completedItems[index]
                              ? "bg-primary border-primary "
                              : "border-royal-light-gray "
                              }`}
                            onClick={(e) => handleCheckboxClick(index, e)}
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
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-75  flex-shrink-0 cursor-pointer ${completedItems[index]
                              ? "bg-primary border-primary "
                              : "border-royal-light-gray "
                              }`}
                            onClick={(e) => handleCheckboxClick(index, e)}
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
                <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96 mb-6">
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

                {/* Lecture Description */}
                {lectures[currentItem]?.description && (
                  <div className="bg-white rounded-lg border border-royal-light-gray p-6 mb-6">
                    <h3 className="text-lg font-semibold text-royal-dark-gray mb-4">Description</h3>
                    <p className="text-royal-gray text-sm leading-relaxed">
                      {lectures[currentItem].description}
                    </p>
                  </div>
                )}

                {/* Lecture Content */}
                {lectures[currentItem]?.content && (
                  <div className="bg-white rounded-lg border border-royal-light-gray p-6 mb-6">
                    <div
                      className="lecture-content max-w-none text-royal-gray leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: lectures[currentItem].content }}
                      style={{
                        fontSize: '14px',
                        lineHeight: '1.6'
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
                                {(file.uploadedUrl ? 'Uploaded file' : 'External link')}
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
                            <span className="hidden sm:inline">Download</span>
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