import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EyeOffIcon, PlayIcon, CheckCircleIcon, MoveLeftIcon, PauseIcon, Volume2Icon, VolumeXIcon, MaximizeIcon } from "lucide-react";
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
  const [showFullTitle, setShowFullTitle] = useState(false);
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
  const handleVideoClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Video clicked, current state:', isVideoPlaying, 'Fullscreen:', isFullscreen);
    if (videoRef.current) {
      if (isVideoPlaying) {
        console.log('Pausing video');
        videoRef.current.pause();
      } else {
        console.log('Playing video');
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
      }
    } else {
      console.log('Video ref not available');
    }
  };

  const handlePlayPause = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
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

  const handleMute = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
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


  const handleFullscreen = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        // Mobile-friendly fullscreen
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        } else if ((videoRef.current as any).webkitRequestFullscreen) {
          (videoRef.current as any).webkitRequestFullscreen();
        } else if ((videoRef.current as any).mozRequestFullScreen) {
          (videoRef.current as any).mozRequestFullScreen();
        } else if ((videoRef.current as any).msRequestFullscreen) {
          (videoRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    }
  };

  const handleVideoDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Double click detected on video area');
    handleFullscreen();
  };

  // Fullscreen-specific click handler
  const handleFullscreenVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Fullscreen video clicked, current state:', isVideoPlaying);
    if (videoRef.current) {
      if (isVideoPlaying) {
        console.log('Pausing video in fullscreen');
        videoRef.current.pause();
      } else {
        console.log('Playing video in fullscreen');
        videoRef.current.play().catch(error => {
          console.error('Error playing video in fullscreen:', error);
        });
      }
    }
  };

  // Mobile-friendly fullscreen handler
  const handleMobileFullscreen = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (videoRef.current) {
      // For mobile, we'll use a different approach
      const video = videoRef.current;

      // Try to enter fullscreen
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if ((video as any).webkitRequestFullscreen) {
        (video as any).webkitRequestFullscreen();
      } else if ((video as any).mozRequestFullScreen) {
        (video as any).mozRequestFullScreen();
      } else if ((video as any).msRequestFullscreen) {
        (video as any).msRequestFullscreen();
      } else {
        // Fallback: make video larger on mobile
        video.style.position = 'fixed';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100vw';
        video.style.height = '100vh';
        video.style.zIndex = '9999';
        video.style.backgroundColor = 'black';
        setIsFullscreen(true);
      }
    }
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
    const handlePlay = () => {
      console.log('Video play event triggered');
      setIsVideoPlaying(true);
    };
    const handlePause = () => {
      console.log('Video pause event triggered');
      setIsVideoPlaying(false);
    };
    const handleEnded = () => {
      setIsVideoPlaying(false);
      // Auto-mark as complete when video ends
      setCompletedItems(prev =>
        prev.map((completed, i) => i === currentItem ? true : completed)
      );
    };
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      console.log('Fullscreen change:', isFullscreen);
      setIsFullscreen(isFullscreen);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
    <div className="p-2 sm:p-4 animate-in fade-in duration-300">
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
            className="cursor-pointer p-2 rounded-lg hover:bg-royal-blue/5 transition-all duration-300 hover:scale-105"
            onClick={() => navigate('/courses', { state: { fromDetail: true } })}
            title="Back to Courses"
          >
            <ArrowLeftIcon className="h-6 w-6 text-royal-gray hover:text-royal-blue transition-colors duration-300" />
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
                  className="inline-flex items-center gap-2 px-3 py-2 text-royal-gray hover:text-royal-blue cursor-pointer transition-all duration-300 hover:bg-royal-blue/5 rounded-lg"
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
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0 ${completedItems[currentItem]
                      ? "bg-primary border-primary"
                      : "border-royal-light-gray"
                      }`}
                    onClick={(e) => handleCheckboxClick(currentItem, e)}
                  >
                    {completedItems[currentItem] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-300" />}
                  </div>
                </div>

                {/* Video Content */}
                <div
                  className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96 
                             group cursor-pointer"
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={() => setShowControls(false)}
                  onClick={handleVideoClick}
                  onDoubleClick={handleVideoDoubleClick}
                >
                  <div
                    className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden relative"
                    title="Click to play/pause, double-click for fullscreen"
                    onClick={handleVideoClick}
                    onDoubleClick={handleVideoDoubleClick}
                  >
                    {/* Video Element */}
                    <video
                      ref={videoRef}
                      src={curriculumItems[currentItem].videoUrl}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={(e) => isFullscreen ? handleFullscreenVideoClick(e) : handleVideoClick(e)}
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
 transition-all duration-300"
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
                            e.stopPropagation();
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

                        {/* Control Buttons - Mobile Optimized */}
                        <div className="flex flex-col gap-3 text-white">
                          {/* Top Row - Main Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white hover:bg-white/20 p-3 rounded-lg"
                                onClick={(e) => handlePlayPause(e)}
                              >
                                {isVideoPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                              </Button>
                            </div>

                            {/* Video Title - Full title in control bar */}
                            <div className="flex-1 flex justify-center px-4">
                              <div className="text-center">
                                <span className="text-xs text-white/70 line-clamp-2 max-w-xs">
                                  {curriculumItems[currentItem].title}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium bg-black/30 px-2 py-1 rounded">
                                {formatTime(currentTime)} / {curriculumItems[currentItem].duration}
                              </span>
                            </div>
                          </div>

                          {/* Bottom Row - Volume and Speed Controls */}
                          <div className="flex items-center justify-between gap-4">
                            {/* Volume Controls */}
                            <div className="flex items-center gap-2 flex-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white hover:bg-white/20 p-2 rounded-lg"
                                onClick={(e) => handleMute(e)}
                                title={isMuted ? "Unmute" : "Mute"}
                              >
                                {isMuted ? <VolumeXIcon className="h-5 w-5" /> : <Volume2Icon className="h-5 w-5" />}
                              </Button>

                              <div className="flex-1 max-w-24">
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={isMuted ? 0 : volume}
                                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                                  style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                                  }}
                                />
                              </div>
                            </div>

                            {/* Playback Speed */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/70">Speed:</span>
                              <select
                                value={playbackRate}
                                onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/20 focus:border-white/40 focus:outline-none"
                              >
                                <option value={0.5}>0.5x</option>
                                <option value={0.75}>0.75x</option>
                                <option value={1}>1x</option>
                                <option value={1.25}>1.25x</option>
                                <option value={1.5}>1.5x</option>
                                <option value={2}>2x</option>
                              </select>
                            </div>

                            {/* Fullscreen Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20 p-2"
                              onClick={(e) => handleMobileFullscreen(e)}
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
              {/* Back Button */}
              <div className="mb-4">
                <div
                  className="inline-flex items-center gap-2 px-3 py-2 text-royal-gray hover:text-royal-blue cursor-pointer transition-all duration-300 hover:bg-royal-blue/5 rounded-lg"
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
                      className={`w-full flex items-center p-2 sm:p-4 rounded-lg border transition-all duration-300 ease-in-out cursor-pointer group ${index === currentItem
                        ? "bg-primary/5 border-primary shadow-lg scale-[1.02] ring-2 ring-primary/30"
                        : "bg-white border-royal-light-gray"
                        }`}
                      onClick={() => handleItemClick(index)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300  flex-shrink-0 cursor-pointer ${completedItems[index]
                            ? "bg-primary border-primary "
                            : "border-royal-light-gray "
                            }`}
                          onClick={(e) => handleCheckboxClick(index, e)}
                        >
                          {completedItems[index] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-300 " />}
                        </div>
                        <span className={`font-medium transition-colors duration-300  ${index === currentItem
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
                      className={`w-full flex items-center p-2 sm:p-4 rounded-lg border transition-all duration-300 ease-in-out cursor-pointer group ${index === currentItem
                        ? "bg-primary/5 border-primary shadow-lg scale-[1.02] ring-2 ring-primary/30 min-[1024px]:bg-primary/10 min-[1024px]:shadow-xl min-[1024px]:scale-[1.03] min-[1024px]:ring-4 min-[1024px]:ring-primary/40"
                        : "bg-white border-royal-light-gray"
                        }`}
                      onClick={() => handleItemClick(index)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300  flex-shrink-0 cursor-pointer ${completedItems[index]
                            ? "bg-primary border-primary "
                            : "border-royal-light-gray "
                            }`}
                          onClick={(e) => handleCheckboxClick(index, e)}
                        >
                          {completedItems[index] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-300 " />}
                        </div>
                        <span className={`font-medium transition-colors duration-300  ${index === currentItem
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
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0 ${completedItems[currentItem]
                    ? "bg-primary border-primary"
                    : "border-royal-light-gray"
                    }`}
                  onClick={(e) => handleCheckboxClick(currentItem, e)}
                >
                  {completedItems[currentItem] && <CheckCircleIcon className="h-4 w-4 text-white transition-transform duration-300" />}
                </div>
              </div>

              {/* Video Content */}
              <div
                className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg min-h-96 
                     group cursor-pointer"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
                onClick={handleVideoClick}
                onDoubleClick={handleVideoDoubleClick}
              >
                <div
                  className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden relative"
                  title="Click to play/pause, double-click for fullscreen"
                  onClick={handleVideoClick}
                  onDoubleClick={handleVideoDoubleClick}
                >
                  {/* Video Element */}
                  <video
                    ref={videoRef}
                    src={curriculumItems[currentItem].videoUrl}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={(e) => isFullscreen ? handleFullscreenVideoClick(e) : handleVideoClick(e)}
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
 transition-all duration-300"
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
                          e.stopPropagation();
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

                      {/* Control Buttons - Desktop */}
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 p-2"
                            onClick={(e) => handlePlayPause(e)}
                          >
                            {isVideoPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 p-2"
                            onClick={(e) => handleMute(e)}
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
                              onClick={(e) => e.stopPropagation()}
                              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Video Title - Full title in control bar */}
                        <div className="flex-1 flex justify-center px-4">
                          <div className="text-center">
                            <span className="text-xs text-white/70 line-clamp-2 max-w-md">
                              {curriculumItems[currentItem].title}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm">
                            {formatTime(currentTime)} / {curriculumItems[currentItem].duration}
                          </span>

                          <select
                            value={playbackRate}
                            onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black/50 text-white text-sm rounded px-2 py-1"
                          >
                            <option value={0.5}>0.5x</option>
                            <option value={0.75}>0.75x</option>
                            <option value={1}>1x</option>
                            <option value={1.25}>1.25x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                          </select>

                          {/* Fullscreen Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 p-2"
                            onClick={(e) => handleFullscreen(e)}
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