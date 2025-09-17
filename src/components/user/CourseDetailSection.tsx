import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EyeOffIcon, PlayIcon, CheckCircleIcon, MoveLeftIcon, PauseIcon, Volume2Icon, VolumeXIcon, MaximizeIcon, RotateCcwIcon, SkipBackIcon, SkipForwardIcon } from "lucide-react";
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  // Video player functions
  const handleVideoClick = () => {
    if (isVideoPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const handleSkipBack = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const handleSkipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleVideoDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Double click detected on video');
    handleFullscreen();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);
    const handleEnded = () => {
      setIsVideoPlaying(false);
      // Auto-mark as complete when video ends
      setCompletedItems(prev =>
        prev.map((completed, i) => i === currentItem ? true : completed)
      );
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentItem]);

  // Reset video when changing items
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsVideoPlaying(false);
    }
  }, [currentItem]);

  return (
    <div className="p-4 animate-in fade-in duration-300">
      {/* Header - Desktop only */}
      <div className="hidden min-[1024px]:flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/courses', { state: { fromDetail: true } })}
          className="flex items-center gap-3 px-6 py-3 bg-white hover:bg-royal-blue/5 hover:border-royal-blue/20 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
        >
          <ArrowLeftIcon className="h-5 w-5 text-royal-gray" />
          <span className="text-royal-dark-gray font-medium">Back to Courses</span>
        </Button>
        <div className="w-full flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray">
          <EyeOffIcon className="h-6 w-6 text-royal-gray" />
          <div>
            <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">Anonymity</h1>
            <p className="text-royal-gray">
              Make yourself invisible and prevent lawsuits before they begin.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex">
        {/* Mobile: Show only list or only content */}
        {window.innerWidth < 1024 ? (
          showMobileContent ? (
            /* Mobile Content View */
            <div className="flex-1 flex flex-col w-full">
              {/* Back Button */}
              <div className="mb-6">
                <Button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-royal-blue/5 border border-royal-light-gray hover:border-royal-blue/20 text-royal-dark-gray hover:text-royal-blue transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="font-medium">Back to List</span>
                </Button>
              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="w-full flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-royal-light-gray mb-6 
                             hover:shadow-lg hover:scale-[1.02] hover:border-royal-blue/20 
                             transition-all duration-300 ease-in-out group">
                  <h1 className="text-2xl font-bold text-royal-dark-gray group-hover:text-royal-blue transition-colors duration-300">
                    {curriculumItems[currentItem].title}
                  </h1>
                  {/* Completion Status Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 flex-shrink-0 ${completedItems[currentItem]
                      ? "bg-primary border-primary hover:bg-royal-blue-dark hover:border-royal-blue-dark"
                      : "border-royal-light-gray hover:border-royal-blue/50"
                      }`}
                    onClick={(e) => handleCheckboxClick(currentItem, e)}
                  >
                    {completedItems[currentItem] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-300" />}
                  </div>
                </div>

                {/* Video Content */}
                <div
                  className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96 
                             hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out group"
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={() => setShowControls(false)}
                >
                  <div
                    className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden relative 
                                group-hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onDoubleClick={handleVideoDoubleClick}
                    title="Double-click for fullscreen"
                  >
                    {/* Video Element */}
                    <video
                      ref={videoRef}
                      src={curriculumItems[currentItem].videoUrl}
                      className="w-full h-full object-cover"
                      onClick={handleVideoClick}
                      onDoubleClick={handleVideoDoubleClick}
                    />

                    {/* Overlay Controls */}
                    <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${showControls || !isVideoPlaying ? 'opacity-100' : 'opacity-0'}`}>
                      {/* Center Play/Pause Button */}
                      {!isVideoPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            size="lg"
                            className="bg-black/70 hover:bg-black/80 text-white rounded-full p-6 
                                     group-hover:scale-110 transition-all duration-300"
                            onClick={handlePlayPause}
                          >
                            <PlayIcon className="h-12 w-12 ml-1" />
                          </Button>
                        </div>
                      )}

                      {/* Bottom Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="w-full bg-white/30 rounded-full h-1 cursor-pointer" onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const newTime = (clickX / rect.width) * duration;
                            handleSeek(newTime);
                          }}>
                            <div
                              className="bg-primary h-1 rounded-full transition-all duration-100"
                              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20 p-2"
                              onClick={handlePlayPause}
                            >
                              {isVideoPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20 p-2"
                              onClick={handleSkipBack}
                            >
                              <SkipBackIcon className="h-5 w-5" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20 p-2"
                              onClick={handleSkipForward}
                            >
                              <SkipForwardIcon className="h-5 w-5" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20 p-2"
                              onClick={handleMute}
                            >
                              {isMuted ? <VolumeXIcon className="h-5 w-5" /> : <Volume2Icon className="h-5 w-5" />}
                            </Button>

                            <div className="w-20">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm">
                              {formatTime(currentTime)} / {curriculumItems[currentItem].duration}
                            </span>

                            <select
                              value={playbackRate}
                              onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                              className="bg-black/50 text-white text-sm rounded px-2 py-1"
                            >
                              <option value={0.5}>0.5x</option>
                              <option value={0.75}>0.75x</option>
                              <option value={1}>1x</option>
                              <option value={1.25}>1.25x</option>
                              <option value={1.5}>1.5x</option>
                              <option value={2}>2x</option>
                            </select>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20 p-2"
                              onClick={handleFullscreen}
                            >
                              <MaximizeIcon className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Mobile List View */
            <div className="w-full bg-white p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-royal-dark-gray mb-4">Land Trusts</h3>
                <div className="space-y-4">
                  {curriculumItems.map((item, index) => (
                    <div
                      key={index}
                      className={`w-full flex items-center p-3 sm:p-4 rounded-lg border transition-all duration-300 ease-in-out cursor-pointer group ${index === currentItem
                        ? "bg-primary/5 border-primary shadow-lg scale-[1.02] ring-2 ring-primary/30"
                        : "bg-white border-royal-light-gray hover:shadow-lg hover:scale-[1.02] hover:border-royal-blue/20"
                        }`}
                      onClick={() => handleItemClick(index)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0 cursor-pointer ${completedItems[index]
                            ? "bg-primary border-primary group-hover:bg-royal-blue-dark group-hover:border-royal-blue-dark"
                            : "border-royal-light-gray group-hover:border-royal-blue/50"
                            }`}
                          onClick={(e) => handleCheckboxClick(index, e)}
                        >
                          {completedItems[index] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />}
                        </div>
                        <span className={`font-medium transition-colors duration-300 group-hover:text-royal-blue ${index === currentItem
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
                <h3 className="font-semibold text-royal-dark-gray mb-4">Land Trusts</h3>
                <div className="space-y-4">
                  {curriculumItems.map((item, index) => (
                    <div
                      key={index}
                      className={`w-full flex items-center p-3 sm:p-4 rounded-lg border transition-all duration-300 ease-in-out cursor-pointer group ${index === currentItem
                        ? "bg-primary/5 border-primary shadow-lg scale-[1.02] ring-2 ring-primary/30 min-[1024px]:bg-primary/10 min-[1024px]:shadow-xl min-[1024px]:scale-[1.03] min-[1024px]:ring-4 min-[1024px]:ring-primary/40"
                        : "bg-white border-royal-light-gray hover:shadow-lg hover:scale-[1.02] hover:border-royal-blue/20"
                        }`}
                      onClick={() => handleItemClick(index)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0 cursor-pointer ${completedItems[index]
                            ? "bg-primary border-primary group-hover:bg-royal-blue-dark group-hover:border-royal-blue-dark"
                            : "border-royal-light-gray group-hover:border-royal-blue/50"
                            }`}
                          onClick={(e) => handleCheckboxClick(index, e)}
                        >
                          {completedItems[index] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />}
                        </div>
                        <span className={`font-medium transition-colors duration-300 group-hover:text-royal-blue ${index === currentItem
                          ? "text-primary font-semibold min-[1024px]:text-primary min-[1024px]:font-bold min-[1024px]:text-lg"
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
              <div className="w-full flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-royal-light-gray mb-6 
                       hover:shadow-lg hover:scale-[1.02] hover:border-royal-blue/20 
                       transition-all duration-300 ease-in-out group">
                <h1 className="text-2xl font-bold text-royal-dark-gray group-hover:text-royal-blue transition-colors duration-300">
                  {curriculumItems[currentItem].title}
                </h1>
                {/* Completion Status Checkbox */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 flex-shrink-0 ${completedItems[currentItem]
                    ? "bg-primary border-primary hover:bg-royal-blue-dark hover:border-royal-blue-dark"
                    : "border-royal-light-gray hover:border-royal-blue/50"
                    }`}
                  onClick={(e) => handleCheckboxClick(currentItem, e)}
                >
                  {completedItems[currentItem] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-300" />}
                </div>
              </div>

              {/* Video Content */}
              <div
                className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96 
                     hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out group"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
              >
                <div
                  className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden relative 
                      group-hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onDoubleClick={handleVideoDoubleClick}
                  title="Double-click for fullscreen"
                >
                  {/* Video Element */}
                  <video
                    ref={videoRef}
                    src={curriculumItems[currentItem].videoUrl}
                    className="w-full h-full object-cover"
                    onClick={handleVideoClick}
                    onDoubleClick={handleVideoDoubleClick}
                  />

                  {/* Overlay Controls */}
                  <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${showControls || !isVideoPlaying ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Center Play/Pause Button */}
                    {!isVideoPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          size="lg"
                          className="bg-black/70 hover:bg-black/80 text-white rounded-full p-6 
                               group-hover:scale-110 transition-all duration-300"
                          onClick={handlePlayPause}
                        >
                          <PlayIcon className="h-12 w-12 ml-1" />
                        </Button>
                      </div>
                    )}

                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="w-full bg-white/30 rounded-full h-1 cursor-pointer" onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const newTime = (clickX / rect.width) * duration;
                          handleSeek(newTime);
                        }}>
                          <div
                            className="bg-primary h-1 rounded-full transition-all duration-100"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 p-2"
                            onClick={handlePlayPause}
                          >
                            {isVideoPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 p-2"
                            onClick={handleSkipBack}
                          >
                            <SkipBackIcon className="h-5 w-5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 p-2"
                            onClick={handleSkipForward}
                          >
                            <SkipForwardIcon className="h-5 w-5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 p-2"
                            onClick={handleMute}
                          >
                            {isMuted ? <VolumeXIcon className="h-5 w-5" /> : <Volume2Icon className="h-5 w-5" />}
                          </Button>

                          <div className="w-20">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={isMuted ? 0 : volume}
                              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm">
                            {formatTime(currentTime)} / {curriculumItems[currentItem].duration}
                          </span>

                          <select
                            value={playbackRate}
                            onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                            className="bg-black/50 text-white text-sm rounded px-2 py-1"
                          >
                            <option value={0.5}>0.5x</option>
                            <option value={0.75}>0.75x</option>
                            <option value={1}>1x</option>
                            <option value={1.25}>1.25x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                          </select>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 p-2"
                            onClick={handleFullscreen}
                          >
                            <MaximizeIcon className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}