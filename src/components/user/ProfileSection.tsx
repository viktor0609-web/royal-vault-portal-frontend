import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, CalendarIcon, VideoIcon, ClockIcon, CheckCircleIcon, LoaderIcon, EditIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ProfileEditForm } from "./ProfileEditForm";

interface ProfileData {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    // New profile fields
    utms?: string;
    lifecycleStage?: string;
    street?: string;
    city?: string;
    state?: string;
    postal?: string;
    // HubSpot properties
    firstname?: string;
    lastname?: string;
    company?: string;
    country?: string;
    hubspot_state?: string;
    hubspot_city?: string;
    zip?: string;
    address?: string;
    lifecyclestage?: string;
    hs_lead_status?: string;
    createdate?: string;
    lastmodifieddate?: string;
    website?: string;
    industry?: string;
    jobtitle?: string;
    annualrevenue?: string;
    numberofemployees?: string;
    client_type?: string;
}

export function ProfileSection() {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Mock meeting logs data (keeping for now as it's not related to profile editing)
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

    // Fetch profile data from backend (with HubSpot integration)
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/api/auth/profile'); // This endpoint includes HubSpot data
                setProfileData(data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfileData();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2">
                        <LoaderIcon className="h-6 w-6 animate-spin text-royal-gray" />
                        <span className="text-royal-gray">Loading profile...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-500 mb-2">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-royal-blue hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
                <div className="flex items-center justify-center h-64">
                    <p className="text-royal-gray">No profile data available</p>
                </div>
            </div>
        );
    }

    // Use HubSpot data if available, otherwise fall back to database data
    const displayName = profileData.firstname || profileData.firstName;
    const displayLastName = profileData.lastname || profileData.lastName;

    // Address data - prioritize local form data, fallback to HubSpot
    const addressData = {
        country: profileData.country || profileData.country,
        street: profileData.street || profileData.address,
        city: profileData.city || profileData.city,
        state: profileData.state || profileData.state,
        postal: profileData.postal || profileData.zip
    };

    // Lifecycle stage - prioritize local form data, fallback to HubSpot
    const lifecycleStage = profileData.lifecycleStage || profileData.lifecyclestage;

    const handleProfileUpdate = (updatedData: any) => {
        setProfileData(updatedData);
        setIsEditing(false);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
    };

    return (
        <div className="flex-1 p-2 sm:p-4 animate-in fade-in duration-100">
            <div className="flex gap-2 sm:gap-4 items-center justify-between bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-3 sm:mb-4">
                <div className="flex gap-2 sm:gap-4 items-center">
                    <UserIcon className="h-8 w-8 sm:h-12 sm:w-12 text-royal-gray hidden min-[700px]:block" />
                    <div>
                        <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2">PROFILE                                                    <Badge variant={profileData.isVerified ? "default" : "secondary"} className="ml-auto">
                            {profileData.isVerified ? "Verified" : "Unverified"}
                        </Badge></h1>
                        <p className="text-xs sm:text-base text-royal-gray">
                            {isEditing ? "Edit your personal information and account details." : "View your personal information and account details."}
                        </p>
                    </div>
                </div>
                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-royal-blue hover:bg-royal-blue/90 text-white"
                        size="sm"
                    >
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                )}
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
                    {isEditing ? (
                        <ProfileEditForm
                            profileData={profileData}
                            onProfileUpdate={handleProfileUpdate}
                            onCancel={handleEditCancel}
                        />
                    ) : (
                        <>
                            {/* Mobile: Compact View */}
                            <div className="block sm:hidden space-y-3">
                                <Card className="border-royal-light-gray">
                                    <CardHeader>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="h-4 w-4 text-royal-gray" />
                                            <div>
                                                <p className="text-xs text-royal-gray">First Name</p>
                                                <p className="text-sm font-medium text-royal-dark-gray">{displayName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="h-4 w-4 text-royal-gray" />
                                            <div>
                                                <p className="text-xs text-royal-gray">Last Name</p>
                                                <p className="text-sm font-medium text-royal-dark-gray">{displayLastName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MailIcon className="h-4 w-4 text-royal-gray" />
                                            <div>
                                                <p className="text-xs text-royal-gray">Email</p>
                                                <p className="text-sm font-medium text-royal-dark-gray">{profileData.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <PhoneIcon className="h-4 w-4 text-royal-gray" />
                                            <div>
                                                <p className="text-xs text-royal-gray">Phone</p>
                                                <p className="text-sm font-medium text-royal-dark-gray">{profileData.phone}</p>
                                            </div>
                                        </div>
                                        {lifecycleStage && (
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="h-4 w-4 text-royal-gray" />
                                                <div>
                                                    <p className="text-xs text-royal-gray">Lifecycle Stage</p>
                                                    <p className="text-sm font-medium text-royal-dark-gray">{lifecycleStage}</p>
                                                </div>
                                            </div>
                                        )}
                                        {(addressData.street || addressData.city || addressData.state || addressData.postal) && (
                                            <div className="flex items-center gap-2">
                                                <MapPinIcon className="h-4 w-4 text-royal-gray" />
                                                <div>
                                                    <p className="text-xs text-royal-gray">Address</p>
                                                    <p className="text-sm font-medium text-royal-dark-gray">
                                                        {[addressData.street, addressData.city, addressData.state, addressData.postal].filter(Boolean).join(', ') || 'No address provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {profileData.client_type && (
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="h-4 w-4 text-royal-gray" />
                                                <div>
                                                    <p className="text-xs text-royal-gray">Client Type</p>
                                                    <p className="text-sm font-medium text-royal-dark-gray">{profileData.client_type}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="h-4 w-4 text-royal-gray" />
                                            <div>
                                                <p className="text-xs text-royal-gray">Role</p>
                                                <p className="text-sm font-medium text-royal-dark-gray capitalize">{profileData.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-royal-gray" />
                                            <div>
                                                <p className="text-xs text-royal-gray">Member Since</p>
                                                <p className="text-sm font-medium text-royal-dark-gray">
                                                    {new Date(profileData.createdate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Desktop: Full View */}
                            <div className="hidden sm:block space-y-6">
                                <Card className="border-royal-light-gray">
                                    <CardHeader>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-royal-gray">First Name</label>
                                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                                    <UserIcon className="h-4 w-4 text-royal-gray" />
                                                    <span className="text-royal-dark-gray truncate flex-1 min-w-0">{displayName}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-royal-gray">Last Name</label>
                                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                                    <UserIcon className="h-4 w-4 text-royal-gray" />
                                                    <span className="text-royal-dark-gray truncate flex-1 min-w-0">{displayLastName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-royal-gray">Email Address</label>
                                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                                    <MailIcon className="h-4 w-4 text-royal-gray" />
                                                    <span className="text-royal-dark-gray truncate flex-1 min-w-0">{profileData.email}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-royal-gray">Phone Number</label>
                                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                                    <PhoneIcon className="h-4 w-4 text-royal-gray" />
                                                    <span className="text-royal-dark-gray truncate flex-1 min-w-0">{profileData.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {lifecycleStage && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-royal-gray">Lifecycle Stage</label>
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                                        <UserIcon className="h-4 w-4 text-royal-gray" />
                                                        <span className="text-royal-dark-gray truncate flex-1 min-w-0">{lifecycleStage}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {(addressData.street || addressData.city || addressData.state || addressData.postal || addressData.country) && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-royal-gray">Address</label>
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                                        <MapPinIcon className="h-4 w-4 text-royal-gray" />
                                                        <span className="text-royal-dark-gray truncate flex-1 min-w-0">
                                                            {[addressData.street, addressData.city, addressData.state, addressData.country, addressData.postal].filter(Boolean).join(', ') || 'No address provided'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {profileData.client_type && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-royal-gray">Client Type</label>
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                                        <UserIcon className="h-4 w-4 text-royal-gray" />
                                                        <span className="text-royal-dark-gray truncate flex-1 min-w-0">{profileData.client_type}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-royal-gray">Account Role</label>
                                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                                    <UserIcon className="h-4 w-4 text-royal-gray" />
                                                    <span className="text-royal-dark-gray capitalize truncate flex-1 min-w-0">{profileData.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-royal-gray">Member Since</label>
                                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                                    <CalendarIcon className="h-4 w-4 text-royal-gray" />
                                                    <span className="text-royal-dark-gray truncate flex-1 min-w-0">
                                                        {new Date(profileData.createdate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                        </div>


                                    </CardContent>
                                </Card>

                            </div>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="meetings" className="space-y-2 sm:space-y-6">
                    <Card className="border-royal-light-gray">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-royal-dark-gray flex items-center gap-2">
                                <VideoIcon className="h-5 w-5" />
                                Meeting History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {meetingLogs.map((meeting) => (
                                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-royal-blue/10 rounded-lg">
                                                <VideoIcon className="h-4 w-4 text-royal-blue" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-royal-dark-gray">{meeting.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-royal-gray">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        {meeting.date}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ClockIcon className="h-3 w-3" />
                                                        {meeting.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                Completed
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}