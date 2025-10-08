import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { api } from "@/lib/api";

export function ReSettingPasswordPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { openDialog } = useAuthDialog();
    const { fetchProfile } = useAuth();

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [disabled, setDisabled] = useState(false);

    const validateField = (field: string, value: string) => {
        switch (field) {
            case "password":
                if (!value) return "Password is required";
                if (value.length < 6) return "Password must be at least 6 characters";
                break;
            case "confirmPassword":
                if (!value) return "Confirm Password is required";
                if (value !== formData.password) return "Passwords do not match";
                break;
        }
        return "";
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { [key: string]: string } = {};
        Object.keys(formData).forEach((field) => {
            const error = validateField(field, formData[field as keyof typeof formData]);
            if (error) newErrors[field] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setSuccess("");

        try {
            const response = await api.post(`/api/auth/reset-password/${token}`, {
                password: formData.password,
            });

            // If password reset includes tokens, store them and log in user
            if (response.data.accessToken && response.data.refreshToken) {
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("refreshToken", response.data.refreshToken);
                await fetchProfile();
            }

            setSuccess(response.data.message);
            setErrors({});
            setDisabled(true); // Disable inputs and button

            // After 2 seconds, navigate to home page (user is already logged in)
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (err: any) {
            if (err.response?.data?.message) {
                setErrors({ general: err.response.data.message });
            } else {
                setErrors({ general: "Something went wrong. Please try again." });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-royal-dark-gray">
                        Set New Password
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.general && <p className="text-red-500 text-center">{errors.general}</p>}
                    {success && <p className="text-green-500 text-center">{success}</p>}

                    <div>
                        <Label htmlFor="password" className="text-royal-dark-gray font-medium">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter new password"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="mt-1"
                            required
                            disabled={disabled}
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword" className="text-royal-dark-gray font-medium">
                            Confirm Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            className="mt-1"
                            required
                            disabled={disabled}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
                        disabled={loading || disabled}
                    >
                        {loading ? "Setting Password..." : "Set Password"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
