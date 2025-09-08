// hooks/useDaily.ts
import { useEffect, useRef } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";

export function useDaily(roomUrl: string) {
  const callFrameRef = useRef<DailyCall | null>(null);

  useEffect(() => {
    if (!roomUrl) return;

    const callFrame = DailyIframe.createFrame({
      showLeaveButton: true,
      iframeStyle: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        border: "0",
      },
    });

    callFrameRef.current = callFrame;

    callFrame.join({ url: roomUrl });

    return () => {
      callFrame.leave();
      callFrame.destroy();
    };
  }, [roomUrl]);

  return callFrameRef;
}