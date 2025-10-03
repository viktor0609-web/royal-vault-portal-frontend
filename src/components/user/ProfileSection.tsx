import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, CalendarIcon, SaveIcon, LockIcon, EyeIcon, EyeOffIcon, VideoIcon, ClockIcon, CheckCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export function ProfileSection() {
    const { toast } = useToast();
    const { user } = useAuth();

    // Mock user data - in real app this would come from context/API
    const [userData, setUserData] = useState({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        zip: "10001",
        dateOfBirth: "1990-01-01",
        company: "Royal Vault Investments",
        jobTitle: "Investor"
    });

    // Password management state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Mock meeting logs data
    const [meetingLogs] = useState([
        {
            id: 1,
            title: "Liz Zielske & Mark Swedberg",
            link: "https://us02web.zoom.us/j/86388347787?pwd=kyW6uXuZn1xbuhqVZ2LAtnvRSaHiCY.1",
            date: "May 6, 2025",
            time: "7:30 pm"
        },
        {
            id: 2,
            title: "Liz Zielske & Mark Swedberg",
            link: "https://us02web.zoom.us/j/87420817312?pwd=Ts7WWFUzjF92rjO3sFZp6Fyyi4oJTU.1",
            date: "May 21, 2025",
            time: "10:45 pm"
        }
    ]);

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");

    const handleInputChange = (field: string, value: string) => {
        setUserData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSave = () => {
        // In real app, this would save to API
        toast({
            title: "Profile Updated",
            description: "Your personal information has been saved successfully.",
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset to original data
        setUserData({
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "+1 (555) 123-4567",
            address: "123 Main Street",
            city: "New York",
            state: "NY",
            zip: "10001",
            dateOfBirth: "1990-01-01",
            company: "Royal Vault Investments",
            jobTitle: "Investor"
        });
        setIsEditing(false);
    };

    const handlePasswordSave = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "New password and confirm password do not match.",
                variant: "destructive"
            });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast({
                title: "Password Too Short",
                description: "Password must be at least 8 characters long.",
                variant: "destructive"
            });
            return;
        }

        // In real app, this would save to API
        toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
        });

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
        setIsEditingPassword(false);
    };

    const handlePasswordCancel = () => {
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
        setIsEditingPassword(false);
    };

    return (
        <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
            <div className="flex gap-2 sm:gap-4 items-center bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-3 sm:mb-4">
                <UserIcon className="h-8 w-8 sm:h-12 sm:w-12 text-royal-gray hidden min-[700px]:block" />
                <div>
                    <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2">PROFILE</h1>
                    <p className="text-xs sm:text-base text-royal-gray">
                        Manage your personal information and account settings.
                    </p>
                </div>
            </div>

            <Tabs value="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-6">
                    <TabsTrigger value="personal" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                        <UserIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Personal Information</span>
                        <span className="sm:hidden">Personal</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="meetings"
                        disabled
                        className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 opacity-50 cursor-not-allowed text-xs sm:text-sm"
                    >
                        <VideoIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Meetings</span>
                        <span className="sm:hidden">Meetings</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-2 sm:space-y-6">
                    {/* Mobile: Compact View */}
                    <div className="sm:hidden space-y-2">
                        {/* Basic Info Card */}
                        <Card className="hover:shadow-sm transition-shadow duration-75">
                            <CardHeader className="pb-2 px-3">
                                <CardTitle className="flex items-center gap-2 text-black text-xs sm:text-base">
                                    <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-royal-blue" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 px-3">
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="firstName" className="text-black text-xs">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={userData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black text-xs h-7 sm:h-8"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="lastName" className="text-black text-xs">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={userData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black text-sm h-8"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="email" className="text-black text-xs">Email</Label>
                                        <div className="relative">
                                            <MailIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-royal-gray" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={userData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                disabled={!isEditing}
                                                className="pl-7 transition-all duration-75 text-black text-sm h-8"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="phone" className="text-black text-xs">Phone</Label>
                                        <div className="relative">
                                            <PhoneIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-royal-gray" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={userData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                disabled={!isEditing}
                                                className="pl-7 transition-all duration-75 text-black text-sm h-8"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Info Card */}
                        <Card className="hover:shadow-sm transition-shadow duration-75">
                            <CardHeader className="pb-2 px-3 min-[700px]:px-6">
                                <CardTitle className="flex items-center gap-2 text-black text-sm min-[700px]:text-base">
                                    <UserIcon className="h-3 w-3 min-[700px]:h-4 min-[700px]:w-4 text-royal-blue" />
                                    Additional Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 px-3 min-[700px]:px-6">
                                <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="company" className="text-black text-xs">Company</Label>
                                        <Input
                                            id="company"
                                            value={userData.company}
                                            onChange={(e) => handleInputChange('company', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black text-sm h-8"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="jobTitle" className="text-black text-xs">Job Title</Label>
                                        <Input
                                            id="jobTitle"
                                            value={userData.jobTitle}
                                            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black text-sm h-8"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="dateOfBirth" className="text-black text-xs">Date of Birth</Label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-royal-gray" />
                                            <Input
                                                id="dateOfBirth"
                                                type="date"
                                                value={userData.dateOfBirth}
                                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                disabled={!isEditing}
                                                className="pl-7 transition-all duration-75 text-black text-sm h-8"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="address" className="text-black text-xs">Address</Label>
                                        <div className="relative">
                                            <MapPinIcon className="absolute left-2 top-2 h-3 w-3 text-royal-gray" />
                                            <Input
                                                id="address"
                                                placeholder="123 Main Street"
                                                value={userData.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                disabled={!isEditing}
                                                className="pl-7 transition-all duration-75 text-black text-sm h-8"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="city" className="text-black text-xs">City</Label>
                                        <Input
                                            id="city"
                                            value={userData.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black text-sm h-8"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="state" className="text-black text-xs">State</Label>
                                        <Input
                                            id="state"
                                            value={userData.state}
                                            onChange={(e) => handleInputChange('state', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black text-sm h-8"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="zip" className="text-black text-xs">ZIP Code</Label>
                                        <Input
                                            id="zip"
                                            value={userData.zip}
                                            onChange={(e) => handleInputChange('zip', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black text-sm h-8"
                                        />
                                    </div>
                                    <div></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Desktop: Full View */}
                    <div className="hidden min-[700px]:block space-y-6">
                        {/* Personal Information Card */}
                        <Card className="hover:shadow-sm transition-shadow duration-75">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-black">
                                    <UserIcon className="h-5 w-5 text-royal-blue" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-3 min-[700px]:gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-black">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={userData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-black">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={userData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-3 min-[700px]:gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-black">Email Address</Label>
                                        <div className="relative">
                                            <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-royal-gray" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={userData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                disabled={!isEditing}
                                                className="pl-10 transition-all duration-75 text-black"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-black">Phone Number</Label>
                                        <div className="relative">
                                            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-royal-gray" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={userData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                disabled={!isEditing}
                                                className="pl-10 transition-all duration-75 text-black"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-3 min-[700px]:gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-black">Address</Label>
                                        <div className="relative">
                                            <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-royal-gray" />
                                            <Input
                                                id="address"
                                                placeholder="123 Main Street"
                                                value={userData.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                disabled={!isEditing}
                                                className="pl-10 transition-all duration-75 text-black"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-black">City</Label>
                                        <Input
                                            id="city"
                                            value={userData.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-3 min-[700px]:gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="state" className="text-black">State</Label>
                                        <Input
                                            id="state"
                                            value={userData.state}
                                            onChange={(e) => handleInputChange('state', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zip" className="text-black">ZIP Code</Label>
                                        <Input
                                            id="zip"
                                            value={userData.zip}
                                            onChange={(e) => handleInputChange('zip', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-3 min-[700px]:gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth" className="text-black">Date of Birth</Label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-royal-gray" />
                                            <Input
                                                id="dateOfBirth"
                                                type="date"
                                                value={userData.dateOfBirth}
                                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                disabled={!isEditing}
                                                className="pl-10 transition-all duration-75 text-black"
                                            />
                                        </div>
                                    </div>
                                    <div></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Professional Information Card */}
                        <Card className="hover:shadow-sm transition-shadow duration-75">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-black">
                                    <UserIcon className="h-5 w-5 text-royal-blue" />
                                    Professional Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-3 min-[700px]:gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="company" className="text-black">Company</Label>
                                        <Input
                                            id="company"
                                            value={userData.company}
                                            onChange={(e) => handleInputChange('company', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle" className="text-black">Job Title</Label>
                                        <Input
                                            id="jobTitle"
                                            value={userData.jobTitle}
                                            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                            disabled={!isEditing}
                                            className="transition-all duration-75 text-black"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Password Management Card */}
                    <Card className="hover:shadow-sm transition-shadow duration-75">
                        <CardHeader className="pb-2 px-3 min-[700px]:px-6 min-[700px]:pb-6">
                            <CardTitle className="flex items-center gap-2 text-black text-sm min-[700px]:text-lg">
                                <LockIcon className="h-3 w-3 min-[700px]:h-5 min-[700px]:w-5 text-royal-blue" />
                                Password Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 px-3 min-[700px]:px-6 min-[700px]:space-y-4">
                            {!isEditingPassword ? (
                                <div className="flex flex-col min-[700px]:flex-row items-start min-[700px]:items-center justify-between gap-2">
                                    <div>
                                        <p className="text-black font-medium text-xs min-[700px]:text-base">Password</p>
                                        <p className="text-royal-gray text-xs min-[700px]:text-sm">Last changed 30 days ago</p>
                                    </div>
                                    <Button
                                        onClick={() => setIsEditingPassword(true)}
                                        variant="outline"
                                        className="border-royal-light-gray text-royal-gray hover:bg-royal-light-gray transition-all duration-75 hover:scale-101 w-full min-[700px]:w-auto text-xs h-8 min-[700px]:h-10"
                                    >
                                        Change Password
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2 min-[700px]:space-y-4">
                                    <div className="space-y-1 min-[700px]:space-y-2">
                                        <Label htmlFor="currentPassword" className="text-black text-xs min-[700px]:text-base">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showPasswords.current ? "text" : "password"}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                                className="pr-10 transition-all duration-75 text-black text-sm h-8 min-[700px]:h-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-2 min-[700px]:px-3 py-2 hover:bg-transparent"
                                                onClick={() => togglePasswordVisibility('current')}
                                            >
                                                {showPasswords.current ? <EyeOffIcon className="h-3 w-3 min-[700px]:h-4 min-[700px]:w-4" /> : <EyeIcon className="h-3 w-3 min-[700px]:h-4 min-[700px]:w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-1 min-[700px]:space-y-2">
                                        <Label htmlFor="newPassword" className="text-black text-xs min-[700px]:text-base">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showPasswords.new ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                                className="pr-10 transition-all duration-75 text-black text-sm h-8 min-[700px]:h-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-2 min-[700px]:px-3 py-2 hover:bg-transparent"
                                                onClick={() => togglePasswordVisibility('new')}
                                            >
                                                {showPasswords.new ? <EyeOffIcon className="h-3 w-3 min-[700px]:h-4 min-[700px]:w-4" /> : <EyeIcon className="h-3 w-3 min-[700px]:h-4 min-[700px]:w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-1 min-[700px]:space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-black text-xs min-[700px]:text-base">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                                className="pr-10 transition-all duration-75 text-black text-sm h-8 min-[700px]:h-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-2 min-[700px]:px-3 py-2 hover:bg-transparent"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                            >
                                                {showPasswords.confirm ? <EyeOffIcon className="h-3 w-3 min-[700px]:h-4 min-[700px]:w-4" /> : <EyeIcon className="h-3 w-3 min-[700px]:h-4 min-[700px]:w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col min-[700px]:flex-row gap-2 min-[700px]:gap-3 justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={handlePasswordCancel}
                                            className="border-royal-light-gray text-royal-gray hover:bg-royal-light-gray transition-all duration-75 hover:scale-101 w-full min-[700px]:w-auto text-xs h-8 min-[700px]:h-10"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handlePasswordSave}
                                            className="bg-primary hover:bg-royal-blue-dark text-white px-6 transition-all duration-75 hover:scale-101 hover:shadow-sm w-full min-[700px]:w-auto text-xs h-8 min-[700px]:h-10"
                                        >
                                            <LockIcon className="h-3 w-3 min-[700px]:h-4 min-[700px]:w-4 mr-2" />
                                            Update Password
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col min-[700px]:flex-row gap-2 min-[700px]:gap-3 justify-end">
                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="bg-primary hover:bg-royal-blue-dark text-white px-6 transition-all duration-75 hover:scale-101 hover:shadow-sm text-xs h-8 min-[700px]:h-10 w-full min-[700px]:w-auto"
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="border-royal-light-gray text-royal-gray hover:bg-royal-light-gray transition-all duration-75 hover:scale-101 text-xs h-8 min-[700px]:h-10 w-full min-[700px]:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="bg-primary hover:bg-royal-blue-dark text-white px-6 transition-all duration-75 hover:scale-101 hover:shadow-sm text-xs h-8 min-[700px]:h-10 w-full min-[700px]:w-auto"
                                >
                                    <SaveIcon className="h-3 w-3 min-[700px]:h-4 min-[700px]:w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="meetings" className="space-y-2 min-[700px]:space-y-6">
                    <div className="text-center py-8">
                        <VideoIcon className="h-12 w-12 text-royal-gray mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-black mb-2">Meetings Tab Disabled</h3>
                        <p className="text-royal-gray text-sm">
                            This feature is currently unavailable.
                        </p>
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}
