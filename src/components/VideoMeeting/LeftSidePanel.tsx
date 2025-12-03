import { Button } from "@/components/ui/button";
import { Pin } from "lucide-react";
import type { Webinar } from "@/types";

interface LeftSidePanelProps {
  webinar: Webinar | null;
  pinnedMessages?: Array<{
    id: string;
    text: string;
    senderName?: string;
    createdAt?: string;
  }>;
}

export const LeftSidePanel: React.FC<LeftSidePanelProps> = ({ webinar, pinnedMessages = [] }) => {
  const ctas = webinar?.ctas || [];

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* CTA Buttons Section */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">Call to Action</h3>
        <div className="space-y-2">
          {ctas.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-3">No CTA buttons available</p>
          ) : (
            ctas.map((cta, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-2.5 px-3 text-sm font-medium hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 border-gray-300 text-gray-700"
                onClick={() => {
                  if (cta.link) {
                    window.open(cta.link, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                {cta.label}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* Pinned Messages Section */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Pin className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Pinned Messages</h3>
        </div>
        <div className="space-y-3">
          {pinnedMessages.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No pinned messages</p>
          ) : (
            pinnedMessages.map((message) => (
              <div
                key={message.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 shadow-sm"
              >
                {message.senderName && (
                  <div className="text-xs font-semibold text-gray-700 mb-1.5">
                    {message.senderName}
                  </div>
                )}
                <p className="text-sm text-gray-800 leading-relaxed">{message.text}</p>
                {message.createdAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(message.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

