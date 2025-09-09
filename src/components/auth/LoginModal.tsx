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

export function Login() {
  const { activeDialog, openDialog, closeDialog } = useAuthDialog();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating account:", formData);
    closeDialog();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={activeDialog === "login" && !window.location.href.includes('registration')} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-royal-dark-gray">
            Log In
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
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="firstName" className="text-royal-dark-gray font-medium">
              Password
            </Label>
            <Input
              id="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <a onClick={() => openDialog('reset')} className="text-sm text-primary cursor-pointer">Reset password</a>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
          >
            Login
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => openDialog('signup')}
              className="text-primary hover:underline text-sm"
            >
              Create Account
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}