import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuthDialog } from "@/context/AuthDialogContext";
import { api } from "@/lib/api"; // Make sure your API instance is exported


export function ResetPassword() {
  const { activeDialog, openDialog, closeDialog } = useAuthDialog();

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/auth/forgot-password", { email });
      setMsg(data.message);
      setIsError(false); // success
    } catch {
      setMsg("Error sending reset link");
      setIsError(true); // error
    }
  };

  return (
    <Dialog open={activeDialog === "reset"} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-royal-dark-gray">
            Reset Password
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-royal-dark-gray font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="johnsmith@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
          >
            Reset Password
          </Button>

          {msg && (
            <p
              className={`text-center text-sm mt-2 ${isError ? "text-red-500" : "text-green-500"
                }`}
            >
              {msg}
            </p>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => openDialog("login")}
              className="text-primary hover:underline text-sm"
            >
              Back To Log In
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
