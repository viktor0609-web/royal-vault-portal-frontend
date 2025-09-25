import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { VideoIcon, ArrowRightIcon, PlayIcon, EyeIcon, CheckCircleIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { webinarApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useAuthDialog } from "@/context/AuthDialogContext";

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
  const [registering, setRegistering] = useState<string | null>(null);
  const [unregistering, setUnregistering] = useState<string | null>(null);
  const [registeredWebinars, setRegisteredWebinars] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();
  const { openDialog } = useAuthDialog();


  const fetchWebinars = useCallback(async () => {
    try {
      setLoading(true);
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
    }
  }, [user, toast]);

  // Fetch webinars when user changes
  useEffect(() => {
    if (user !== undefined) {
      fetchWebinars();
    }
  }, [user, fetchWebinars]);

  const handleRegister = async (webinar: Webinar) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to register for webinars",
        variant: "destructive",
      });
      // Open login dialog
      openDialog("login");
      return;
    }

    setRegistering(webinar._id);
    try {
      // Register using user's ID (comes from JWT token)
      await webinarApi.registerForWebinar(webinar._id);

      // Immediately update local state to show registered status
      setRegisteredWebinars(prev => new Set([...prev, webinar._id]));

      toast({
        title: "Success!",
        description: "You have successfully registered for the webinar",
      });

      // Force refresh webinars to update registration status immediately
      setTimeout(async () => {
        await fetchWebinars();
      }, 500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to register for webinar",
        variant: "destructive",
      });
    } finally {
      setRegistering(null);
    }
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

  const handleJoinWebinar = (webinar: Webinar) => {
    // Check if user is registered for upcoming webinars
    if (filterIndex === 0 && !isUserRegistered(webinar)) {
      toast({
        title: "Registration Required",
        description: "Please register for this webinar to access the live session",
        variant: "destructive",
      });
      return;
    }

    // Live video functionality has been removed
    toast({
      title: "Live Video Unavailable",
      description: "Live video meetings are currently not available. Please check back later.",
      variant: "destructive",
    });
  };

  const changeFilter = (index: number) => {
    setFilterIndex(index);
  };

  // Filter webinars based on selected tab
  const getFilteredWebinars = useMemo(() => {
    const now = new Date();
    const currentWebinars = webinars.filter(webinar => webinar.portalDisplay === 'Yes');

    switch (filterIndex) {
      case 0: // UPCOMING
        return currentWebinars.filter(webinar => {
          const webinarDate = new Date(webinar.date);
          return webinarDate > now && webinar.status !== 'Ended';
        });
      case 1: // REPLAYS
        return currentWebinars.filter(webinar => {
          const webinarDate = new Date(webinar.date);
          return webinarDate <= now || webinar.status === 'Ended';
        });
      case 2: // WATCHED
        return currentWebinars.filter(webinar => {
          return webinar.attendees?.some(attendee =>
            attendee.user === user?._id && attendee.attendanceStatus === 'attended'
          );
        });
      default:
        return [];
    }
  }, [webinars, filterIndex, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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

  return (
    <div className="flex-1 p-2 min-[700px]:p-4 animate-in fade-in duration-100">
      <div className="flex items-center gap-2 min-[700px]:gap-4 bg-white p-3 min-[700px]:p-6 rounded-lg border border-royal-light-gray mb-1">
        <VideoIcon className="h-12 w-12 text-royal-gray hidden min-[700px]:block" />
        <div>
          <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">WEBINARS</h1>
          <p className="text-royal-gray">
            Register for upcoming live webinars or watch replays.
          </p>
        </div>
      </div>

      <div className="flex flex-col min-[700px]:flex-row gap-2 min-[700px]:gap-3 items-center min-[700px]:items-center bg-white p-3 min-[700px]:p-6 rounded-lg border border-royal-light-gray mb-2">
        <p className="text-royal-gray hidden min-[700px]:block">Filter by:</p>
        <div className="flex gap-1 min-[700px]:gap-2 justify-center w-full min-[700px]:w-auto">
          {filterTabs.map((tab, index) => (
            <Button
              key={index}
              variant={index == filterIndex ? "default" : "outline"}
              size="sm"
              className={`text-xs min-[700px]:text-sm px-2 min-[700px]:px-4 py-1 min-[700px]:py-2 ${index == filterIndex
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
        <div className="flex items-center justify-center p-8">
          <div className="text-royal-gray">Loading webinars...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-red-500">{error}</div>
        </div>
      ) : (
        <div className="space-y-2">
          {getFilteredWebinars.map((webinar, index) => {
            const isRegistered = isUserRegistered(webinar);
            const isRegistering = registering === webinar._id;
            const isUnregistering = unregistering === webinar._id;
            const isProcessing = isRegistering || isUnregistering;

            return (
              <div
                key={webinar._id}
                onClick={() => {
                  if (filterIndex === 0) {
                    // For upcoming webinars, only registered users can access live webinar
                    if (isRegistered) {
                      handleJoinWebinar(webinar);
                    } else {
                      // Prevent navigation and show message
                      toast({
                        title: "Registration Required",
                        description: "Please register for this webinar to access the live session",
                        variant: "destructive",
                      });
                      return; // Prevent any further action
                    }
                  } else if (filterIndex === 1) {
                    // For replays, anyone can access
                    handleJoinWebinar(webinar);
                  } else if (filterIndex === 2) {
                    // For watched webinars, anyone can access
                    handleJoinWebinar(webinar);
                  }
                }}
                className={`flex items-center justify-between p-3 min-[700px]:p-6 bg-sidebar rounded-lg border border-royal-light-gray transition-all duration-75 ease-in-out group animate-in slide-in-from-bottom duration-200 ${filterIndex === 0 && !isRegistered
                  ? 'cursor-not-allowed opacity-75 hover:opacity-100'
                  : 'cursor-pointer hover:shadow-sm hover:scale-[1.005] hover:border-royal-blue/10'
                  }`}
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-royal-dark-gray mb-2 group-hover:text-royal-blue transition-colors duration-75">
                    {webinar.name}
                  </h3>
                  <div className="flex items-center gap-2 min-[700px]:gap-4 text-sm text-royal-gray">
                    <span className="group-hover:text-royal-dark-gray transition-colors duration-75">
                      {formatDate(webinar.date)} @ {formatTime(webinar.date)}
                    </span>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium group-hover:bg-primary/20 group-hover:scale-102 transition-all duration-75">
                      {webinar.streamType}
                    </span>
                    {isRegistered && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-medium">
                        Registered
                      </span>
                    )}
                  </div>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden min-[700px]:flex gap-2">
                  {filterIndex === 0 ? (
                    // For upcoming webinars
                    isRegistered ? (
                      // If registered, show unregister button
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
                      // If not registered, show register button
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegister(webinar);
                        }}
                        disabled={isProcessing}
                        className="bg-primary hover:bg-royal-blue-dark text-white px-8 group-hover:scale-102 group-hover:shadow-sm transition-all duration-75"
                      >
                        {isRegistering ? 'Registering...' : 'Register'}
                      </Button>
                    )
                  ) : (
                    // For replays and watched webinars
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinWebinar(webinar);
                      }}
                      disabled={isProcessing}
                      className="bg-primary hover:bg-royal-blue-dark text-white px-8 group-hover:scale-102 group-hover:shadow-sm transition-all duration-75"
                    >
                      {filterIndex === 1 ? 'Re-watch' : 'View Details'}
                    </Button>
                  )}
                </div>

                {/* Mobile Action Buttons */}
                <div className="min-[700px]:hidden flex gap-2">
                  {filterIndex === 0 ? (
                    // For upcoming webinars
                    isRegistered ? (
                      // If registered, show unregister button
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
                      // If not registered, show register button
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
                              {isRegistering ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircleIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
                            {isRegistering ? 'Registering...' : 'Register for Webinar'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  ) : (
                    // For replays and watched webinars
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
                            {filterIndex === 1 ? (
                              <PlayIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
                          {filterIndex === 1 ? 'Watch Replay' : 'View Details'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            );
          })}

          {getFilteredWebinars.length === 0 && (
            <div className="flex items-center justify-center p-8">
              <div className="text-royal-gray">
                {filterIndex === 0 ? 'No upcoming webinars' :
                  filterIndex === 1 ? 'No replay webinars available' :
                    'No watched webinars'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}