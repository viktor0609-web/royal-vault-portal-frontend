import { useCallback } from "react";
import { userApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { User } from "../types";

interface UseUserActionsProps {
  onSuccess: () => void;
}

export function useUserActions({ onSuccess }: UseUserActionsProps) {
  const { toast } = useToast();

  const handleResetPassword = useCallback(async (userId: string) => {
    try {
      const response = await userApi.resetUserPassword(userId, { sendEmail: true });
      const resetUrl = response.data?.resetUrl;

      if (resetUrl) {
        try {
          await navigator.clipboard.writeText(resetUrl);
          toast({
            title: "Success",
            description: "Password reset email sent. Reset URL copied to clipboard!",
          });
        } catch (clipboardError) {
          toast({
            title: "Success",
            description: `Password reset email sent. Reset URL: ${resetUrl}`,
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Password reset email sent successfully",
        });
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleToggleVerification = useCallback(async (user: User) => {
    try {
      await userApi.toggleUserVerification(user._id, !user.isVerified);
      toast({
        title: "Success",
        description: `User ${!user.isVerified ? "activated" : "deactivated"} successfully`,
      });
      onSuccess();
    } catch (error: any) {
      console.error("Error toggling verification:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    }
  }, [toast, onSuccess]);

  const handleChangeRole = useCallback(async (user: User, newRole: "user" | "admin") => {
    try {
      await userApi.changeUserRole(user._id, newRole);
      toast({
        title: "Success",
        description: `User role changed to ${newRole} successfully`,
      });
      onSuccess();
    } catch (error: any) {
      console.error("Error changing role:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change role",
        variant: "destructive",
      });
    }
  }, [toast, onSuccess]);

  const handleDelete = useCallback(async (user: User) => {
    try {
      await userApi.deleteUser(user._id);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      onSuccess();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, onSuccess]);

  const handleViewAsUser = useCallback(async (user: User) => {
    try {
      const response = await userApi.getViewAsUserUrl(user._id);
      const viewAsUrl = response.data?.viewAsUrl;
      if (viewAsUrl) {
        window.open(viewAsUrl, "_blank", "noopener,noreferrer");
        toast({
          title: "View as User",
          description: `Opening new tab as ${user.firstName} ${user.lastName}...`,
        });
      } else {
        toast({
          title: "Error",
          description: "Could not generate view-as link",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error getting view-as link:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to open view as user",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    handleResetPassword,
    handleToggleVerification,
    handleChangeRole,
    handleDelete,
    handleViewAsUser,
  };
}
