import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { ReceiptRussianRuble, VideoIcon, Users, Eye, Edit, BarChart3, Calendar, UserCheck, Trash2, Loader2, RefreshCw } from "lucide-react";
import { WebinarModal } from "./WebinarModal";
import { RecsModal } from "./RecsModal";
import { webinarApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Webinar {
    _id: string;
    name: string;
    slug: string;
    status: string;
    portalDisplay: string;
    date: string;
    attendees: Array<{
        user: any;
        attendanceStatus: string;
        registeredAt: string;
    }>;
    streamType: string;
    line1: string;
    line2?: string;
    line3?: string;
}

export function WebinarSection() {
    const navigate = useNavigate();
    const { toast } = useToast();

    // State management
    const [webinars, setWebinars] = useState<Webinar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [recsOpen, setRecsOpen] = useState(false);
    const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch webinars on component mount
    useEffect(() => {
        fetchWebinars();
    }, []);

    const fetchWebinars = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await webinarApi.getAllWebinars('detailed');
            setWebinars(response.data.webinars || []);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch webinars';
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setOpen(false);
        setRecsOpen(false);
        setEditingWebinar(null);
    }
    const handleWebinarSaved = async (webinarData: Webinar, isUpdate: boolean) => {
        if (isUpdate) {
            setWebinars(prev => prev.map(w => w._id === webinarData._id ? webinarData : w));
        } else {
            setWebinars(prev => [webinarData, ...prev]);
        }

        // Refresh the webinar list to ensure data consistency
        await fetchWebinars();
    };

    const handleDeleteWebinar = async (webinarId: string) => {
        if (!confirm('Are you sure you want to delete this webinar?')) return;

        try {
            await webinarApi.deleteWebinar(webinarId);
            setWebinars(prev => prev.filter(w => w._id !== webinarId));
            toast({
                title: "Success",
                description: "Webinar deleted successfully",
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete webinar';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handlebtnClick = async (action: string, item?: Webinar) => {
        setActionLoading(action);

        try {
            switch (action) {
                case 'create': {
                    // Make API request to get promotional SMS lists for the modal
                    try {
                        const response = await fetch('/api/promotional-sms-lists');
                        const data = await response.json();

                        setEditingWebinar(null);
                        setOpen(true);

                        toast({
                            title: "Create Webinar",
                            description: "Opening webinar creation form",
                        });
                    } catch (error) {
                        toast({
                            title: "Warning",
                            description: "Failed to load promotional SMS lists, but you can still create the webinar",
                            variant: "destructive",
                        });
                        setEditingWebinar(null);
                        setOpen(true);
                    }
                    break;
                }
                case 'edit': {
                    // Make API request to get full webinar details for editing
                    const response = await webinarApi.getWebinarById(item!._id, 'full');
                    const webinarData = response.data.webinar;

                    setEditingWebinar(webinarData);
                    setOpen(true);

                    toast({
                        title: "Edit Webinar",
                        description: "Loading webinar details for editing",
                    });
                    break;
                }
                case 'delete': {
                    await handleDeleteWebinar(item!._id);
                    break;
                }
                case 'web': {
                    navigate(`/royal-tv/${item!.slug}/user`);
                    break;
                }
                case 'host': {
                    navigate(`/royal-tv/${item!.slug}/admin`);
                    break;
                }
                case 'guest': {
                    navigate(`/royal-tv/${item!.slug}/guest`);
                    break;
                }
                case 'stats': {
                    // Make API request to get webinar attendees for stats
                    const response = await webinarApi.getWebinarAttendees(item!._id);
                    const attendeesData = response.data.attendees;

                    // Navigate to stats page with webinar and attendees data
                    const statsUrl = `/admin/webinar_stats?title=${encodeURIComponent(item!.name)}&id=${item!._id}&attendees=${encodeURIComponent(JSON.stringify(attendeesData))}`;
                    navigate(statsUrl);

                    toast({
                        title: "Webinar Stats",
                        description: "Loading webinar statistics",
                    });
                    break;
                }
                case 'recs': {
                    // Make API request to get webinar details for recordings
                    const response = await webinarApi.getWebinarById(item!._id, 'full');
                    const webinarData = response.data.webinar;

                    setRecsOpen(true);

                    toast({
                        title: "Recordings",
                        description: "Opening webinar recordings panel",
                    });
                    break;
                }
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || `Failed to execute ${action} action`;
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    // Helper functions
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getRegistrantsCount = (attendees: any[]) => {
        return attendees?.length || 0;
    };

    const getAttendeesCount = (attendees: any[]) => {
        return attendees?.filter(a => a.attendanceStatus === 'attended').length || 0;
    };

    const getReWatchCount = (attendees: any[]) => {
        // This would need to be tracked separately in the backend
        return 0;
    };

    if (loading) {
        return (
            <div className="flex-1 p-1 sm:p-2 lg:p-4 flex flex-col animate-in fade-in duration-100">
                <div className="flex gap-2 items-center bg-white p-3 sm:p-4 lg:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
                    <VideoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-royal-gray hidden sm:block" />
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-royal-dark-gray uppercase">Webinars</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-royal-gray" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-1 sm:p-2 lg:p-4 flex flex-col animate-in fade-in duration-100">
                <div className="flex gap-2 items-center bg-white p-3 sm:p-4 lg:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
                    <VideoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-royal-gray hidden sm:block" />
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-royal-dark-gray uppercase">Webinars</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={fetchWebinars}>Retry</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-1 sm:p-2 lg:p-4 flex flex-col animate-in fade-in duration-100">
            <div className="flex gap-2 items-center justify-between bg-white p-3 sm:p-4 lg:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
                <div className="flex gap-2 items-center">
                    <VideoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-royal-gray hidden sm:block" />
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-royal-dark-gray uppercase">Webinars</h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={fetchWebinars}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => handlebtnClick('create')}
                        size="sm"
                        disabled={actionLoading === 'create'}
                        className="flex items-center gap-2"
                    >
                        {actionLoading === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                        Create
                    </Button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-royal-light-gray overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <Table className="w-full min-w-[1000px] text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-48 min-w-48">Webinar</TableHead>
                            <TableHead className="w-32 min-w-32">Status</TableHead>
                            <TableHead className="w-32 min-w-32">PortalDisplay</TableHead>
                            <TableHead className="w-32 min-w-32">Date EST</TableHead>
                            <TableHead className="w-32 min-w-32">Registrants</TableHead>
                            <TableHead className="w-32 min-w-32">Attendees</TableHead>
                            <TableHead className="w-32 min-w-32">Re-Watch</TableHead>
                            <TableHead className="w-32 min-w-32 text-right">

                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {webinars.map((webinar) => (
                            <TableRow key={webinar._id}>
                                <TableCell>{webinar.name}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${webinar.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                        webinar.status === 'In Progress' ? 'bg-green-100 text-green-800' :
                                            webinar.status === 'Ended' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {webinar.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${webinar.portalDisplay === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {webinar.portalDisplay}
                                    </span>
                                </TableCell>
                                <TableCell>{formatDate(webinar.date)}</TableCell>
                                <TableCell>{getRegistrantsCount(webinar.attendees)}</TableCell>
                                <TableCell>{getAttendeesCount(webinar.attendees)}</TableCell>
                                <TableCell>{getReWatchCount(webinar.attendees)}</TableCell>
                                <TableCell className="w-96 min-w-96">
                                    <div className="flex gap-1 justify-end">
                                        <Button
                                            className="w-16"
                                            onClick={() => handlebtnClick('edit', webinar)}
                                            disabled={actionLoading === 'edit'}
                                        >
                                            {actionLoading === 'edit' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Edit'}
                                        </Button>
                                        <Button
                                            className="w-16"
                                            onClick={() => handlebtnClick('web', webinar)}
                                            disabled={actionLoading === 'web'}
                                        >
                                            {actionLoading === 'web' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Web'}
                                        </Button>
                                        <Button
                                            className="w-16"
                                            onClick={() => handlebtnClick('host', webinar)}
                                            disabled={actionLoading === 'host'}
                                        >
                                            {actionLoading === 'host' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Host'}
                                        </Button>
                                        <Button
                                            className="w-16"
                                            onClick={() => handlebtnClick('guest', webinar)}
                                            disabled={actionLoading === 'guest'}
                                        >
                                            {actionLoading === 'guest' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guest'}
                                        </Button>
                                        <Button
                                            className="w-16"
                                            onClick={() => handlebtnClick('stats', webinar)}
                                            disabled={actionLoading === 'stats'}
                                        >
                                            {actionLoading === 'stats' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Stats'}
                                        </Button>
                                        <Button
                                            className="w-16"
                                            onClick={() => handlebtnClick('recs', webinar)}
                                            disabled={actionLoading === 'recs'}
                                        >
                                            {actionLoading === 'recs' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Recs'}
                                        </Button>
                                        <Button
                                            className="w-16 bg-red-500 hover:bg-red-600"
                                            onClick={() => handlebtnClick('delete', webinar)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
                {webinars.map((webinar) => (
                    <div key={webinar._id} className="bg-white rounded-lg border border-royal-light-gray p-3 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h3 className="font-semibold text-royal-dark-gray text-base sm:text-lg mb-1">{webinar.name}</h3>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-royal-gray mb-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${webinar.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                        webinar.status === 'In Progress' ? 'bg-green-100 text-green-800' :
                                            webinar.status === 'Ended' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {webinar.status}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${webinar.portalDisplay === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {webinar.portalDisplay === 'Yes' ? 'Visible' : 'Hidden'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlebtnClick('edit', webinar)}
                                    className="h-7 w-7 p-0"
                                    title="Edit"
                                    disabled={actionLoading === 'edit'}
                                >
                                    {actionLoading === 'edit' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Edit className="h-3 w-3" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlebtnClick('delete', webinar)}
                                    className="h-7 w-7 p-0 bg-red-500 hover:bg-red-600"
                                    title="Delete"
                                    disabled={actionLoading === 'delete'}
                                >
                                    {actionLoading === 'delete' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm text-royal-gray mb-2">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {formatDate(webinar.date)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm text-royal-gray mb-2">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {getRegistrantsCount(webinar.attendees)} registrants
                                </span>
                                <span className="flex items-center gap-1">
                                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {getAttendeesCount(webinar.attendees)} attendees
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {getReWatchCount(webinar.attendees)} re-watch
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-1 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('web', webinar)}
                                className="text-xs px-2 py-1"
                            >
                                Web
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('host', webinar)}
                                className="text-xs px-2 py-1"
                            >
                                Host
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('guest', webinar)}
                                className="text-xs px-2 py-1"
                            >
                                Guest
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('recs', webinar)}
                                className="text-xs px-2 py-1"
                            >
                                Recs
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <WebinarModal
                isOpen={open}
                closeDialog={closeModal}
                editingWebinar={editingWebinar}
                onWebinarSaved={handleWebinarSaved}
            />
            <RecsModal isOpen={recsOpen} closeDialog={closeModal} />
        </div>
    );
}