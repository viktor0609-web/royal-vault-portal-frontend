import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { VideoIcon, ArrowRightIcon, PlayIcon, EyeIcon, CheckCircleIcon, RefreshCwIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { webinarApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useAuthDialog } from "@/context/AuthDialogContext";
import { useNavigate } from "react-router-dom";
import { markChecklistItemCompleted, CHECKLIST_ITEMS } from "@/utils/checklistUtils";
import { formatDate, formatTime } from "@/utils/dateUtils";

const filterTabs = [
  { label: "UPCOMING" },
  { label: "REPLAYS" },
  { label: "WATCHED" },
];

// Remove static data - will be replaced with API data

interface Webinar {
  _id: string;
  name: string;
  date: string;
  streamType: string;
  status: string;
  portalDisplay: string;
  slug: string;
  line1: string;
  line2: string;
  line3: string;
  recording?: string;
  attendees?: Array<{
    user: string;
    attendanceStatus: string;
    registeredAt: string;
  }>;
}

export function WebinarsSection() {
  const [filterIndex, setFilterIndex] = useState(0);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unregistering, setUnregistering] = useState<string | null>(null);
  const [registeredWebinars, setRegisteredWebinars] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const isInitialMount = useRef(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { openDialog } = useAuthDialog();
  const navigate = useNavigate();


  // Mark "Join a live webinar" as completed when WebinarsSection is visited
  useEffect(() => {
    markChecklistItemCompleted(CHECKLIST_ITEMS.JOIN_WEBINAR);
  }, []);

  const fetchWebinars = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await webinarApi.getPublicWebinars('detailed');
      const webinarsData = response.data.webinars;
      setWebinars(webinarsData);

      // Initialize registered webinars state
      if (user && user._id) {
        const registeredIds = new Set<string>();
        webinarsData.forEach(webinar => {
          if (webinar.attendees?.some(attendee => {
            const attendeeUserId = attendee.user.toString();
            const currentUserId = user._id.toString();
            return attendeeUserId === currentUserId;
          })) {
            registeredIds.add(webinar._id);
          }
        });
        setRegisteredWebinars(registeredIds);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load webinars");
      toast({
        title: "Error",
        description: "Failed to load webinars",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, toast]);

  // Fetch webinars when user changes
  useEffect(() => {
    if (user !== undefined) {
      fetchWebinars();
    }
  }, [user, fetchWebinars]);

  // Refresh when filter tab changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Skip refresh on initial mount
    }

    if (user !== undefined && !loading) {
      fetchWebinars(true);
    }
  }, [filterIndex]); // Only depend on filterIndex, not fetchWebinars to avoid unnecessary refreshes

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (user === undefined || loading) {
      return; // Don't set up interval if user is not loaded or initial load is in progress
    }

    const intervalId = setInterval(() => {
      fetchWebinars(true);
    }, 30000); // 30 seconds

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, [user, loading, fetchWebinars]);

  const handleRegister = (webinar: Webinar) => {
    // Open registration page in new window/tab with webinar details
    const registrationUrl = `/webinar-register?id=${webinar._id}&title=${encodeURIComponent(webinar.name)}&date=${encodeURIComponent(webinar.date)}&is_user=true`;
    window.open(registrationUrl, '_blank');
  };

  const handleUnregister = async (webinar: Webinar) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to unregister from webinars",
        variant: "destructive",
      });
      return;
    }

    setUnregistering(webinar._id);
    try {
      await webinarApi.unregisterFromWebinar(webinar._id);

      // Update local state immediately
      setRegisteredWebinars(prev => {
        const newSet = new Set(prev);
        newSet.delete(webinar._id);
        return newSet;
      });

      toast({
        title: "Success!",
        description: "You have successfully unregistered from the webinar",
      });

      // Force refresh webinars to update registration status immediately
      setTimeout(async () => {
        await fetchWebinars();
      }, 500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to unregister from webinar",
        variant: "destructive",
      });
    } finally {
      setUnregistering(null);
    }
  };

  const handleWatchReplay = (webinar: Webinar) => {
    // Check if recording exists
    if (!webinar.recording) {
      toast({
        title: "Recording Not Available",
        description: "This webinar recording is not available yet.",
        variant: "destructive",
      });
      return;
    }

    // Escape HTML to prevent XSS in title
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // Escape quotes in URL for HTML attribute safety
    const escapeUrl = (url: string) => {
      return url.replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
    };

    const title = escapeHtml(webinar.line1 || webinar.name || 'Webinar Recording');
    const recordingUrl = escapeUrl(webinar.recording);

    // Create a new window with embedded video player
    const videoHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Recording</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            overflow: hidden;
          }
          .video-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          }
          video {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            outline: none;
          }
        </style>
      </head>
      <body>
        <div class="video-container">
          <video controls autoplay style="width: 100%; height: 100%;">
            <source src="${recordingUrl}" type="video/mp4">
            <source src="${recordingUrl}" type="video/webm">
            <source src="${recordingUrl}" type="video/ogg">
            Your browser does not support the video tag.
          </video>
        </div>
      </body>
      </html>
    `;

    // Open new window and write HTML
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(videoHtml);
      newWindow.document.close();
    } else {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to watch recordings.",
        variant: "destructive",
      });
    }
  };

  const handleJoinWebinar = (webinar: Webinar) => {
    // Handle ENDED webinars - show replay/watch
    if (webinar.status === 'Ended') {
      handleWatchReplay(webinar);
      return;
    }

    // For WAITING and IN PROGRESS statuses, check registration
    if (webinar.status === 'Waiting' || webinar.status === 'In Progress') {
      // Check if user is logged in
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to join the webinar",
          variant: "destructive",
        });
        openDialog("login");
        return;
      }

      // Check if user is registered
      if (!isUserRegistered(webinar)) {
        toast({
          title: "Registration Required",
          description: "Please register for this webinar to access the live session",
          variant: "destructive",
        });
        // Redirect to registration page
        const registrationUrl = `/webinar-register?id=${webinar._id}&title=${encodeURIComponent(webinar.name)}&date=${encodeURIComponent(webinar.date)}&is_user=true`;
        navigate(registrationUrl);
        return;
      }

      // User is registered, allow joining
      window.open(`/royal-tv/${webinar.slug}/user`, '_blank');
      return;
    }

    // For SCHEDULED status, this shouldn't be called (should use handleRegister instead)
    // But if it is, redirect to registration
    handleRegister(webinar);
  };

  const changeFilter = (index: number) => {
    setFilterIndex(index);
  };

  // Filter webinars based on selected tab
  const getFilteredWebinars = useMemo(() => {
    const now = new Date();
    const currentWebinars = webinars.filter(webinar => webinar.portalDisplay === 'Yes');

    switch (filterIndex) {
      case 0: // UPCOMING - Show Scheduled, Waiting, In Progress
        return currentWebinars.filter(webinar => {
          return webinar.status === 'Scheduled' ||
            webinar.status === 'Waiting' ||
            webinar.status === 'In Progress';
        });
      case 1: // REPLAYS - Show all Ended webinars
        return currentWebinars.filter(webinar => {
          return webinar.status === 'Ended';
        });
      case 2: // WATCHED - Show Ended webinars where user attended
        return currentWebinars.filter(webinar => {
          return webinar.status === 'Ended' &&
            webinar.attendees?.some(attendee => {
              const attendeeUserId = attendee.user?.toString() || attendee.user;
              const currentUserId = user?._id?.toString();
              return attendeeUserId === currentUserId && attendee.attendanceStatus === 'attended';
            });
        });
      default:
        return [];
    }
  }, [webinars, filterIndex, user]);

  const isUserRegistered = (webinar: Webinar) => {
    if (!user || !user._id) return false;

    // Check local state first (immediate UI update)
    if (registeredWebinars.has(webinar._id)) {
      return true;
    }

    // Check database state
    if (webinar.attendees) {
      return webinar.attendees.some(attendee => {
        const attendeeUserId = attendee.user.toString();
        const currentUserId = user._id.toString();
        return attendeeUserId === currentUserId;
      });
    }

    return false;
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'In Progress':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Ended':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'Scheduled';
      case 'Waiting':
        return 'Waiting';
      case 'In Progress':
        return 'Live';
      case 'Ended':
        return 'Ended';
      default:
        return status;
    }
  };

  const handleRefresh = async () => {
    await fetchWebinars(true);
    toast({
      title: "Refreshed",
      description: "Webinar list has been updated",
    });
  };

  return (
    <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
      <div className="flex items-center justify-between gap-2 sm:gap-4 bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <VideoIcon className="h-8 w-8 sm:h-12 sm:w-12 text-royal-gray hidden min-[700px]:block" />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2">WEBINARS</h1>
            <p className="text-xs sm:text-base text-royal-gray">
              Register for upcoming live webinars or watch replays.
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          variant="outline"
          size="sm"
          className="border-royal-light-gray text-royal-gray hover:bg-royal-light-gray hover:text-royal-dark-gray transition-all duration-75 flex items-center gap-2"
        >
          <RefreshCwIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-xs sm:text-sm">Refresh</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
        <p className="text-xs sm:text-base text-royal-gray hidden sm:block">Filter by:</p>
        <div className="flex gap-1 sm:gap-2 justify-center w-full sm:w-auto">
          {filterTabs.map((tab, index) => (
            <Button
              key={index}
              variant={index == filterIndex ? "default" : "outline"}
              size="sm"
              className={`text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 ${index == filterIndex
                ? "bg-primary hover:bg-royal-blue-dark text-white"
                : "border-royal-light-gray text-royal-gray hover:bg-royal-light-gray"
                }`}
              onClick={() => changeFilter(index)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-4 sm:p-8">
          <div className="text-sm sm:text-base text-royal-gray">Loading webinars...</div>
        </div>
      ) : (
        <div className="space-y-2">
          {getFilteredWebinars.map((webinar, index) => {
            const isRegistered = isUserRegistered(webinar);
            const isUnregistering = unregistering === webinar._id;
            const isProcessing = isUnregistering;

            return (
              <div
                key={webinar._id}
                onClick={() => {
                  if (filterIndex === 0) {
                    // For upcoming webinars, handle based on status
                    if (webinar.status === 'Scheduled') {
                      handleRegister(webinar);
                    } else if (webinar.status === 'Waiting' || webinar.status === 'In Progress') {
                      handleJoinWebinar(webinar);
                    }
                  } else if (filterIndex === 1 || filterIndex === 2) {
                    // For replays and watched webinars
                    handleWatchReplay(webinar);
                  }
                }}
                className={`flex items-center justify-between p-3 sm:p-6 bg-sidebar rounded-lg border border-royal-light-gray transition-all duration-75 ease-in-out group cursor-pointer hover:shadow-sm hover:scale-[1.005] hover:border-royal-blue/10`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-lg font-semibold text-royal-dark-gray mb-1 sm:mb-2 group-hover:text-royal-blue transition-colors duration-75 line-clamp-2">
                    {webinar.line1}
                  </h3>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-royal-gray flex-wrap">
                    <span className="group-hover:text-royal-dark-gray transition-colors duration-75">
                      {formatDate(webinar.date)} @ {formatTime(webinar.date)}
                    </span>
                    {filterIndex === 0 && (
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium border ${getStatusBadgeStyles(webinar.status)}`}>
                        {getStatusLabel(webinar.status)}
                      </span>
                    )}


                    {isRegistered && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-600 rounded text-xs font-medium">
                        Registered
                      </span>
                    )}
                  </div>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden min-[700px]:flex gap-2">
                  {filterIndex === 0 ? (
                    // For upcoming webinars (Scheduled, Waiting, In Progress)
                    webinar.status === 'Scheduled' ? (
                      // SCHEDULED: Show REGISTER button
                      isRegistered ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnregister(webinar);
                          }}
                          disabled={isProcessing}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-75"
                        >
                          {isUnregistering ? 'Canceling...' : 'Cancel Register'}
                        </Button>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegister(webinar);
                          }}
                          disabled={isProcessing}
                          className="bg-primary hover:bg-royal-blue-dark text-white px-8 group-hover:scale-102 group-hover:shadow-sm transition-all duration-75"
                        >
                          REGISTER
                        </Button>
                      )
                    ) : webinar.status === 'Waiting' || webinar.status === 'In Progress' ? (
                      // WAITING/IN PROGRESS: Show JOIN button
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinWebinar(webinar);
                        }}
                        disabled={isProcessing}
                        className="bg-primary hover:bg-royal-blue-dark text-white px-8 group-hover:scale-102 group-hover:shadow-sm transition-all duration-75"
                      >
                        JOIN
                      </Button>
                    ) : null
                  ) : (
                    // For replays and watched webinars (ENDED status)
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWatchReplay(webinar);
                      }}
                      disabled={isProcessing}
                      className="bg-primary hover:bg-royal-blue-dark text-white px-8 group-hover:scale-102 group-hover:shadow-sm transition-all duration-75"
                    >
                      WATCH
                    </Button>
                  )}
                </div>

                {/* Mobile Action Buttons */}
                <div className="min-[700px]:hidden flex gap-2">
                  {filterIndex === 0 ? (
                    // For upcoming webinars (Scheduled, Waiting, In Progress)
                    webinar.status === 'Scheduled' ? (
                      // SCHEDULED: Show register/unregister button
                      isRegistered ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnregister(webinar);
                                }}
                                disabled={isProcessing}
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 w-10 h-10 p-0 rounded-full flex items-center justify-center"
                                style={{ aspectRatio: '1/1' }}
                              >
                                {isUnregistering ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckCircleIcon className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
                              {isUnregistering ? 'Canceling...' : 'Cancel Register'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRegister(webinar);
                                }}
                                disabled={isProcessing}
                                className="bg-primary hover:bg-royal-blue-dark text-white w-10 h-10 p-0 rounded-full group-hover:scale-105 group-hover:shadow-sm transition-all duration-75 flex items-center justify-center"
                                style={{ aspectRatio: '1/1' }}
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
                              REGISTER
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    ) : webinar.status === 'Waiting' || webinar.status === 'In Progress' ? (
                      // WAITING/IN PROGRESS: Show JOIN button
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinWebinar(webinar);
                              }}
                              disabled={isProcessing}
                              className="bg-primary hover:bg-royal-blue-dark text-white w-10 h-10 p-0 rounded-full group-hover:scale-105 group-hover:shadow-sm transition-all duration-75 flex items-center justify-center"
                              style={{ aspectRatio: '1/1' }}
                            >
                              <ArrowRightIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
                            JOIN
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null
                  ) : (
                    // For replays and watched webinars (ENDED status)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWatchReplay(webinar);
                            }}
                            disabled={isProcessing}
                            className="bg-primary hover:bg-royal-blue-dark text-white w-10 h-10 p-0 rounded-full group-hover:scale-105 group-hover:shadow-sm transition-all duration-75 flex items-center justify-center"
                            style={{ aspectRatio: '1/1' }}
                          >
                            <PlayIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
                          WATCH
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              // <a href="https://app.royallegalsolutions.com/royal-tv/we-2025-10-22/user" target="_blank" rel="noopener noreferrer">
              //   Go to Webinar
              // </a>
            );
          })}

          {getFilteredWebinars.length === 0 && (
            <div className="flex items-center justify-center p-4 sm:p-8">
              <div className="text-sm sm:text-base text-royal-gray">
                {filterIndex === 0 ? 'No upcoming webinars (Scheduled, Waiting, or In Progress)' :
                  filterIndex === 1 ? 'No replay webinars available' :
                    'No watched webinars (Ended webinars you attended)'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}