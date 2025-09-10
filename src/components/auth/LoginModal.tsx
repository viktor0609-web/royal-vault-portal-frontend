import { useState, useContext } from "react";
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
import { useAuth } from "@/context/AuthContext";

export function Login() {
  const { activeDialog, openDialog, closeDialog } = useAuthDialog();


  const { login } = useAuth();


  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors("");
    setSuccess("");

    try {
      await login(formData.email, formData.password);

      setSuccess("Login successful!");
      setErrors("");
      setFormData({ email: "", password: "" });

      // Close dialog after success
      setTimeout(() => {
        closeDialog();
      }, 1000);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setErrors(err.response.data.message);
      } else {
        setErrors("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={
        activeDialog === "login" &&
        !window.location.href.includes("registration")
      }
      onOpenChange={closeDialog}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-royal-dark-gray">
            Log In
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors && <p className="text-red-500 text-center">{errors}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}

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
              disabled={loading}
            />
          </div>

          <div>
            <Label
              htmlFor="password"
              className="text-royal-dark-gray font-medium"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="mt-1"
              required
              disabled={loading}
            />
          </div>

          <a
            onClick={() => openDialog("reset")}
            className="text-sm text-primary cursor-pointer"
          >
            Reset password
          </a>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => openDialog("signup")}
              className="text-primary hover:underline text-sm"
              disabled={loading}
            >
              Create Account
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
