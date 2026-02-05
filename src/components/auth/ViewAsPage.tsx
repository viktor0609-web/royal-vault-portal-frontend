import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { authService } from "@/services/api";
import { STORAGE_KEYS } from "@/constants";
import { Loading } from "@/components/ui/Loading";

/**
 * Page opened in a new tab when admin clicks "View as User".
 * Exchanges the one-time code for an access token, stores it, and redirects to home
 * so the tab shows the app as that user.
 */
export function ViewAsPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setStatus("error");
      setMessage("Missing or invalid link.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const { data } = await authService.exchangeViewAsCode(code);
        if (cancelled) return;
        if (data?.accessToken) {
          // Use sessionStorage so this tab only gets the user token; admin tab keeps its own token in localStorage
          sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
          sessionStorage.setItem(STORAGE_KEYS.VIEW_AS_SESSION, "true");
          setStatus("success");
          setMessage("Opening as user...");
          window.location.href = "/";
        } else {
          setStatus("error");
          setMessage("Invalid response. Please try again.");
        }
      } catch (err: any) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Link expired or invalid. Please request a new one."
        );
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 safe-area-padding">
        <Loading message="Opening view as user..." size="md" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 safe-area-padding">
        <div className="bg-white rounded-lg border border-royal-light-gray shadow-sm p-6 max-w-md text-center">
          <h1 className="text-lg font-semibold text-royal-dark-gray mb-2">
            Cannot open view as user
          </h1>
          <p className="text-sm text-royal-gray mb-4">{message}</p>
          <a
            href="/"
            className="text-sm font-medium text-primary hover:underline"
          >
            Return to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 safe-area-padding">
      <Loading message={message} size="md" />
    </div>
  );
}
