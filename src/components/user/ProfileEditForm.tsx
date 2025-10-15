import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserIcon, MailIcon, PhoneIcon, EditIcon, SaveIcon, XIcon, LoaderIcon, MapPinIcon, AxeIcon, StepForwardIcon } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProfileEditFormProps {
    profileData: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        utms?: string;
        lifecyclestage?: string;
        address?: string;   //street address
        city?: string;
        state?: string;
        zip?: string;
    };
    onProfileUpdate: (updatedData: any) => void;
    onCancel: () => void;
}

export function ProfileEditForm({ profileData, onProfileUpdate, onCancel }: ProfileEditFormProps) {
    const [formData, setFormData] = useState({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        utms: profileData.utms || '',
        lifecyclestage: profileData.lifecyclestage || 'Lead',
        street: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        postal: profileData.zip || ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { toast } = useToast();

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
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
            const { data } = await api.put('/api/auth/profile', formData);

            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully.",
            });

            onProfileUpdate(data.user);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Card className="border-royal-light-gray">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-royal-dark-gray flex items-center gap-2">
                    <EditIcon className="h-5 w-5" />
                    Edit Profile Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information - Two fields per row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium text-royal-gray">
                                First Name *
                            </Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-royal-gray" />
                                <Input
                                    id="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                                    placeholder="Enter your first name"
                                />
                            </div>
                            {errors.firstName && (
                                <p className="text-sm text-red-500">{errors.firstName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium text-royal-gray">
                                Last Name *
                            </Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-royal-gray" />
                                <Input
                                    id="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                                    placeholder="Enter your last name"
                                />
                            </div>
                            {errors.lastName && (
                                <p className="text-sm text-red-500">{errors.lastName}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-royal-gray">
                                Email Address *
                            </Label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-royal-gray" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                    placeholder="Enter your email address"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium text-royal-gray">
                                Phone Number *
                            </Label>
                            <div className="relative">
                                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-royal-gray" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-sm text-red-500">{errors.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4 pt-4 border-t border-royal-light-gray">
                        <div className="flex items-center gap-2">
                            <MapPinIcon className="h-5 w-5 text-royal-gray" />
                            <h3 className="text-lg font-semibold text-royal-dark-gray">Address Information</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-sm font-medium text-royal-gray">
                                    City
                                </Label>
                                <Input
                                    id="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    placeholder="Enter your city"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-sm font-medium text-royal-gray">
                                    State
                                </Label>
                                <Input
                                    id="state"
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    placeholder="Enter your state"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            <div className="space-y-2">
                                <Label htmlFor="street" className="text-sm font-medium text-royal-gray">
                                    Street Address
                                </Label>
                                <div className="relative">
                                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-royal-gray" />
                                    <Input
                                        id="street"
                                        type="text"
                                        value={formData.street}
                                        onChange={(e) => handleInputChange('street', e.target.value)}
                                        className="pl-10"
                                        placeholder="Enter your street address"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postal" className="text-sm font-medium text-royal-gray">
                                    Postal Code
                                </Label>
                                <Input
                                    id="postal"
                                    type="text"
                                    value={formData.postal}
                                    onChange={(e) => handleInputChange('postal', e.target.value)}
                                    placeholder="Enter your postal code"
                                />
                            </div>
                        </div>

                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-royal-blue hover:bg-royal-blue/90 text-white"
                        >
                            {loading ? (
                                <>
                                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                            className="border-royal-light-gray text-royal-gray hover:bg-gray-50"
                        >
                            <XIcon className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
