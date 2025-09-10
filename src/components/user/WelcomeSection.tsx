import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, FileTextIcon, MessageCircleIcon, VideoIcon, PlayIcon } from "lucide-react";
import { useAuthDialog } from "@/context/AuthDialogContext";

const welcomeItems = [
  {
    icon: CheckCircleIcon,
    title: "Set your password",
    action: "Create Account",
    completed: true,
  },
  {
    icon: FileTextIcon,
    title: "Get tax, legal, & investing resources",
    action: "Open Resources",
    completed: false,
  },
  {
    icon: VideoIcon,
    title: "Join a live webinar",
    action: "Open Webinars",
    completed: false,
  },
  {
    icon: PlayIcon,
    title: "Watch the overview video",
    action: "Open Video",
    completed: false,
  },
];

export function WelcomeSection() {
  const navigate = useNavigate();
  const { openDialog } = useAuthDialog();

  const handleAction = (action: string) => {
    if (action === "Create Account") {
      openDialog('signup');
    } else if (action == "Open Resources") {
      navigate('/courses');
    } else if (action == "Open Webinars") {
      navigate('/royal-tv')
    }
  };

  return (
    <div className="flex-1 p-4">
      <div className="flex gap-4 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-8">
        <HandIcon className="h-12 w-12 text-royal-gray" />
        <div>
          <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">WELCOME</h1>

          <p className="text-royal-gray">
            Join thousands of investors nationwide and access free live coaching, video training, chats, & more.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {welcomeItems.map((item, index) => (
          <div key={index} className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.completed
                ? "bg-primary border-primary"
                : "border-royal-light-gray"
                }`}>
                {item.completed && <CheckCircleIcon className="h-4 w-4 text-white" />}
              </div>
              <item.icon className="h-5 w-5 text-royal-gray" />
              <span className="text-royal-dark-gray font-medium">{item.title}</span>
            </div>
            <Button
              onClick={() => handleAction(item.action)}
              className="bg-primary hover:bg-royal-blue-dark text-white px-6"
            >
              {item.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Separate the HandIcon import
import { HandIcon } from "lucide-react";