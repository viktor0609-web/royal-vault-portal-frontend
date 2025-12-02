import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { userApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  supaadmin?: boolean;
  isVerified: boolean;
}

interface CreateUserModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  editingUser?: User | null;
}

export function CreateUserModal({ isOpen, closeDialog, editingUser }: CreateUserModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "user" as "user" | "admin",
    supaadmin: false,
    sendVerificationEmail: true,
    createHubSpotContact: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingUser) {
      setFormData({
        firstName: editingUser.firstName || "",
        lastName: editingUser.lastName || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        role: editingUser.role || "user",
        supaadmin: editingUser.supaadmin || false,
        sendVerificationEmail: false, // Don't send email when editing
        createHubSpotContact: false,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "user",
        supaadmin: false,
        sendVerificationEmail: true,
        createHubSpotContact: true,
      });
    }
    setErrors({});
  }, [editingUser, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (editingUser) {
        // Update existing user
        await userApi.updateUser(editingUser._id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          supaadmin: formData.supaadmin,
        });
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        // Create new user
        await userApi.createUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          sendVerificationEmail: formData.sendVerificationEmail,
          createHubSpotContact: formData.createHubSpotContact,
        });
        toast({
          title: "Success",
          description: "User created successfully",
        });
      }
      closeDialog();
    } catch (error: any) {
      console.error("Error saving user:", error);
      const errorMessage = error.response?.data?.message || "Failed to save user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Set field-specific errors if available
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="John"
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Doe"
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john.doe@example.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+1234567890"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange("role", value)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="supaadmin"
              checked={formData.supaadmin}
              onCheckedChange={(checked) =>
                handleChange("supaadmin", checked)
              }
            />
            <Label
              htmlFor="supaadmin"
              className="text-sm font-normal cursor-pointer"
            >
              Supaadmin (can manage users)
            </Label>
          </div>

          {!editingUser && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendVerificationEmail"
                  checked={formData.sendVerificationEmail}
                  onCheckedChange={(checked) =>
                    handleChange("sendVerificationEmail", checked)
                  }
                />
                <Label
                  htmlFor="sendVerificationEmail"
                  className="text-sm font-normal cursor-pointer"
                >
                  Send verification email to user
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createHubSpotContact"
                  checked={formData.createHubSpotContact}
                  onCheckedChange={(checked) =>
                    handleChange("createHubSpotContact", checked)
                  }
                />
                <Label
                  htmlFor="createHubSpotContact"
                  className="text-sm font-normal cursor-pointer"
                >
                  Create contact in HubSpot
                </Label>
              </div>
            </>
          )}

          {editingUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">Note:</p>
              <p>Default password for new users is "123456". User will need to set their own password via verification email.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

