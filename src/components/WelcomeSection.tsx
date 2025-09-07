import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, FileTextIcon, MessageCircleIcon, VideoIcon, PlayIcon } from "lucide-react";
import { CreateAccountModal } from "./CreateAccountModal";

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
    icon: MessageCircleIcon,
    title: "Ask a question in the chat",
    action: "Open Chat",
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
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const handleAction = (action: string) => {
    if (action === "Create Account") {
      setShowCreateAccount(true);
    } else {
      // Handle other actions
      console.log(`Action: ${action}`);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <HandIcon className="h-12 w-12 text-royal-gray" />
          <div>
            <h1 className="text-3xl font-bold text-royal-dark-gray mb-2">WELCOME</h1>
            <p className="text-royal-gray">
              Join thousands of investors nationwide and access free live coaching, video training, chats, & more.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {welcomeItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  item.completed 
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

      <CreateAccountModal 
        open={showCreateAccount} 
        onOpenChange={setShowCreateAccount}
      />
    </div>
  );
}

// Separate the HandIcon import
import { HandIcon } from "lucide-react";