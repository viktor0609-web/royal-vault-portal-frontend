
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BoxSelectIcon, UserIcon } from "lucide-react";
import { AdminMeeting } from "./AdminMeeting";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../ui/select";
import { Button } from "../../ui/button";
import { webinarApi } from "@/lib/api";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDailyMeeting } from "@/context/DailyMeetingContext";

interface Webinar {
  _id: string;
  name: string;
  slug: string;
  line1: string;
  line2?: string;
  line3?: string;
  date: string;
  streamType: string;
  status: string;
}

export const VideoMeeting = () => {
  const { slug } = useParams<{ slug: string }>();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendWebinarStatusChange } = useDailyMeeting();

  /* ---------- Fetch Webinar By Slug ---------- */
  useEffect(() => {
    const fetchWebinar = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const response = await webinarApi.getPublicWebinarBySlug(slug);
        setWebinar(response.data.webinar);
      } catch (error) {
        console.error("Error fetching webinar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWebinar();
  }, [slug]);

  const handleStatusChange = async (newStatus: string) => {
    if (!webinar) return;

    try {
      setUpdatingStatus(true);
      await webinarApi.updateWebinar(webinar._id, { status: newStatus });
      await sendWebinarStatusChange(newStatus);

      // Update local state
      setWebinar({ ...webinar, status: newStatus });

      toast({
        title: "Status Updated",
        description: `Webinar status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating webinar status:", error);
      toast({
        title: "Error",
        description: "Failed to update webinar status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEndWebinar = async () => {
    if (!webinar) return;

    if (!confirm("Are you sure you want to end this webinar? This will close the meeting for all participants.")) {
      return;
    }

    try {
      setEnding(true);
      await webinarApi.endWebinar(webinar._id);
      toast({
        title: "Webinar Ended",
        description: "The webinar has been successfully ended.",
      });

      // Redirect to admin dashboard after a short delay
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (error) {
      console.error("Error ending webinar:", error);
      toast({
        title: "Error",
        description: "Failed to end the webinar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden @container">
      {/* Header - Responsive with mobile-first approach */}
      <header className="flex flex-col sm:flex-row justify-between bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-3 sm:mb-6 flex-shrink-0 gap-3 sm:gap-0">
        <div className="flex gap-2 md:gap-4 items-center min-w-0">
          <img src='/imgs/logo.svg' className=" w-5 sm:w-6 md:w-8" />
          <h1 className="text-sm sm:text-lg md:text-2xl font-bold text-royal-dark-gray uppercase truncate">
            {loading ? "Loading..." : (
              <>
                {webinar?.name || "Webinar"}
              </>
            )}
          </h1>
        </div>
        <div className="flex gap-2 sm:gap-3 items-center flex-wrap sm:flex-nowrap">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Status:</span>
            <Select
              value={webinar?.status || "Scheduled"}
              onValueChange={handleStatusChange}
              disabled={updatingStatus || loading || webinar?.status === 'Ended'}
            >
              <SelectTrigger className="w-[130px] sm:w-[140px] h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Waiting">Waiting</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Ended">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>


      {/* Main Content Area - Uses CSS Grid for modern layout */}
      <main className="flex-1 min-h-0 grid grid-rows-1 grid-cols-1 @[768px]:grid-cols-[1fr_320px] @[1024px]:grid-cols-[1fr_400px] gap-0">
        {/* Video / Room Area - Responsive container */}
        <section className="p-2 sm:p-4 flex flex-col min-h-0 @container/video">
          <AdminMeeting webinarId={webinar?._id} />
        </section>
      </main>
    </div>
  );
}