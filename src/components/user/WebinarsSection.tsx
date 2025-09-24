import { useState, useEffect } from "react";
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
  const [registeredWebinars, setRegisteredWebinars] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();
  const { openDialog } = useAuthDialog();

  // Fetch webinars on component mount
  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      const response = await webinarApi.getPublicWebinars('detailed');
      const webinarsData = response.data.webinars;
      setWebinars(webinarsData);

      // Initialize registered webinars state
      if (user) {
        const registeredIds = new Set<string>();
        webinarsData.forEach(webinar => {
          if (webinar.attendees?.some(attendee =>
            attendee.user.toString() === user.id?.toString()
          )) {
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
  };

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

  const handleJoinWebinar = (webinar: Webinar) => {
    // Navigate to live webinar page
    const webinarUrl = `/webinar_user?webinarId=${webinar._id}&name=${encodeURIComponent(webinar.name)}`;
    window.open(webinarUrl, '_blank');
  };

  const changeFilter = (index: number) => {
    setFilterIndex(index);
  };

  // Filter webinars based on selected tab
  const getFilteredWebinars = () => {
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
            attendee.user === user?.id && attendee.attendanceStatus === 'attended'
          );
        });
      default:
        return [];
    }
  };

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
    if (!user) return false;

    // Check local state first (immediate UI update)
    if (registeredWebinars.has(webinar._id)) {
      return true;
    }

    // Check database state
    if (webinar.attendees) {
      const isRegistered = webinar.attendees.some(attendee =>
        attendee.user.toString() === user.id?.toString()
      );

      // Debug logging
      console.log('User:', user);
      console.log('Webinar attendees:', webinar.attendees);
      console.log('Is registered:', isRegistered);

      return isRegistered;
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
          {getFilteredWebinars().map((webinar, index) => {
            const isRegistered = isUserRegistered(webinar);
            const isRegistering = registering === webinar._id;

            return (
              <div
                key={webinar._id}
                className="flex items-center justify-between p-3 min-[700px]:p-6 bg-sidebar rounded-lg border border-royal-light-gray hover:shadow-sm hover:scale-[1.005] hover:border-royal-blue/10 transition-all duration-75 ease-in-out cursor-pointer group animate-in slide-in-from-bottom duration-200"
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

                {/* Desktop Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (filterIndex === 0 && isRegistered) {
                      handleJoinWebinar(webinar);
                    } else {
                      handleRegister(webinar);
                    }
                  }}
                  disabled={isRegistering}
                  className="hidden min-[700px]:flex bg-primary hover:bg-royal-blue-dark text-white px-8 group-hover:scale-102 group-hover:shadow-sm transition-all duration-75"
                >
                  {isRegistering ? 'Registering...' :
                    filterIndex === 0 ? (isRegistered ? 'Join Live' : 'Register') :
                      filterIndex === 1 ? 'Re-watch' : 'View Details'}
                </Button>

                {/* Mobile Action Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (filterIndex === 0 && isRegistered) {
                            handleJoinWebinar(webinar);
                          } else {
                            handleRegister(webinar);
                          }
                        }}
                        disabled={isRegistering}
                        className="min-[700px]:hidden bg-primary hover:bg-royal-blue-dark text-white w-10 h-10 p-0 rounded-full group-hover:scale-105 group-hover:shadow-sm transition-all duration-75 flex items-center justify-center !rounded-full"
                        style={{ aspectRatio: '1/1' }}
                      >
                        {isRegistering ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : filterIndex === 0 ? (
                          isRegistered ? <PlayIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />
                        ) : filterIndex === 1 ? (
                          <PlayIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
                      {isRegistering ? 'Registering...' :
                        filterIndex === 0 ? (
                          isRegistered ? 'Join Live Webinar' : 'Register for Webinar'
                        ) : filterIndex === 1 ? (
                          'Watch Replay'
                        ) : (
                          'View Details'
                        )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}

          {getFilteredWebinars().length === 0 && (
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