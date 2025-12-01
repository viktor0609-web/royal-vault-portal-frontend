import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { ReceiptRussianRuble, VideoIcon, Users, Eye, Edit, BarChart3, Calendar, UserCheck, Trash2, Loader2, RefreshCw, Menu, MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import { WebinarModal } from "./WebinarModal";
import { RecsModal } from "./RecsModal";
import { webinarApi, api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Webinar } from "@/types";

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
    const [recsWebinar, setRecsWebinar] = useState<Webinar | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [orderBy, setOrderBy] = useState<string>('date');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [webinarToDelete, setWebinarToDelete] = useState<string | null>(null);

    const fetchWebinars = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await webinarApi.getAllWebinars('detailed', { orderBy, order });
            const freshWebinars = response.data.webinars || [];

            // Smart merge: preserve object references for unchanged items to prevent unnecessary re-renders
            // Similar to UsersSection - React uses keys for reconciliation, we preserve references for unchanged items
            setWebinars(prev => {
                // If this is the initial load (prev is empty), just set the new array
                if (prev.length === 0) {
                    return freshWebinars;
                }

                // Create a map of existing webinars for reference comparison
                const existingMap = new Map(prev.map(w => [w._id, w]));

                // Helper function to create a stable comparison key from only the fields displayed in the table
                // This matches UsersSection approach - only compare what's visible
                const getComparisonKey = (w: Webinar) => {
                    // Only compare fields that are displayed in the table UI
                    // This ensures unchanged webinars keep their reference
                    const attendeesCount = w.attendees?.length || 0;
                    const registrantsCount = attendeesCount; // Same as attendees for now
                    const attendeesCount_attended = w.attendees?.filter((a: any) => a.attendanceStatus === 'attended').length || 0;

                    return `${w._id}|${w.name}|${w.status}|${w.portalDisplay}|${w.date}|${registrantsCount}|${attendeesCount_attended}|0`;
                };

                return freshWebinars.map(fresh => {
                    const existing = existingMap.get(fresh._id);
                    if (!existing) {
                        return fresh; // New webinar, return new reference
                    }

                    // Compare using stable keys - only re-render if visible data actually changed
                    const existingKey = getComparisonKey(existing);
                    const freshKey = getComparisonKey(fresh);

                    if (existingKey === freshKey) {
                        return existing; // Preserve reference = no re-render (just like UsersSection)
                    }
                    return fresh; // New reference = will re-render only this item
                });
            });
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
    }, [orderBy, order, toast]);

    // Fetch webinars on component mount and when sort changes
    useEffect(() => {
        fetchWebinars();
    }, [fetchWebinars]);

    const closeModal = () => {
        setOpen(false);
        setRecsOpen(false);
        setEditingWebinar(null);
        setRecsWebinar(null);
    }
    const handleWebinarSaved = async (webinarData: Webinar, isUpdate: boolean) => {
        // Similar to UsersSection - just refetch, let fetchWebinars handle smart merging
        // This ensures only the changed webinar re-renders
        await fetchWebinars();

        // For new webinars, add to the list after refetch
        if (!isUpdate) {
            setWebinars(prev => {
                // Check if it's already in the list (from refetch)
                const exists = prev.some(w => w._id === webinarData._id);
                if (!exists) {
                    return [webinarData, ...prev];
                }
                return prev;
            });
        }
    };

    const handleDeleteWebinar = (webinarId: string) => {
        setWebinarToDelete(webinarId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteWebinar = async () => {
        if (!webinarToDelete) return;

        try {
            await webinarApi.deleteWebinar(webinarToDelete);
            setWebinars(prev => prev.filter(w => w._id !== webinarToDelete));
            toast({
                title: "Success",
                description: "Webinar deleted successfully",
            });
            setDeleteDialogOpen(false);
            setWebinarToDelete(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete webinar';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
            setDeleteDialogOpen(false);
            setWebinarToDelete(null);
        }
    };

    const handlebtnClick = async (action: string, item?: Webinar) => {
        setActionLoading(action);

        try {
            switch (action) {
                case 'create': {
                    // Make API request to get promotional SMS lists for the modal
                    try {
                        const { data } = await api.get('/api/promotional-sms-lists');

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
                case 'register': {
                    window.open(`/webinar-register?id=${item!._id}&title=${encodeURIComponent(item!.name)}&date=${encodeURIComponent(item!.date)}`, "_blank");
                    break;
                }
                case 'web': {
                    window.open(`/royal-tv/${item!.slug}/user`, "_blank");
                    break;
                }
                case 'host': {
                    window.open(`/royal-tv/${item!.slug}/admin`, "_blank");
                    break;
                }
                case 'guest': {
                    window.open(`/royal-tv/${item!.slug}/guest`, "_blank");
                    break;
                }
                case 'recs': {
                    // Make API request to get webinar details for recordings
                    const response = await webinarApi.getWebinarById(item!._id, 'full');
                    const webinarData = response.data.webinar;

                    setRecsWebinar(webinarData);
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

    const handleSort = (field: string) => {
        if (orderBy === field) {
            // Toggle order if clicking the same field
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new field and default to ascending
            setOrderBy(field);
            setOrder('asc');
        }
    };

    const getSortIcon = (field: string) => {
        if (orderBy !== field) {
            return null;
        }
        return order === 'asc' ? (
            <ArrowUp className="h-3 w-3 inline-block ml-1" />
        ) : (
            <ArrowDown className="h-3 w-3 inline-block ml-1" />
        );
    };

    if (loading) {
        return (
            <div className="flex-1 p-2 sm:p-4 flex flex-col animate-in fade-in duration-100 min-w-0">
                <div className="flex gap-2 items-center bg-white p-3 sm:p-4 lg:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
                    <VideoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-royal-gray hidden sm:block" />
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-royal-dark-gray uppercase">Webinars</h1>
                </div>
                <Loading message="Loading webinars..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-2 sm:p-4 flex flex-col animate-in fade-in duration-100 min-w-0">
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
        <div className="flex-1 p-2 sm:p-4 flex flex-col animate-in fade-in duration-100 min-w-0 max-w-full overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-start sm:items-center justify-between bg-white p-3 sm:p-4 lg:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3 min-w-0">
                <div className="flex gap-2 items-center min-w-0 flex-1">
                    <VideoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-royal-gray" />
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-royal-dark-gray uppercase truncate">Webinars</h1>
                </div>
                <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                    <Button
                        onClick={fetchWebinars}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-1 sm:flex-none"
                    >
                        <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>
                    <Button
                        onClick={() => handlebtnClick('create')}
                        size="sm"
                        disabled={actionLoading === 'create'}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-1 sm:flex-none"
                    >
                        {actionLoading === 'create' ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />}
                        <span>Create</span>
                    </Button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-royal-light-gray overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="px-1 py-1.5 text-sm font-semibold cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center">
                                    Webinar
                                    {getSortIcon('name')}
                                </div>
                            </TableHead>
                            <TableHead
                                className="px-1 py-1.5 w-24 text-sm font-semibold cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center">
                                    Status
                                    {getSortIcon('status')}
                                </div>
                            </TableHead>
                            <TableHead className="px-1 py-1.5 w-28 text-sm font-semibold">Portal</TableHead>
                            <TableHead
                                className="px-1 py-1.5 w-32 text-sm font-semibold cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => handleSort('date')}
                            >
                                <div className="flex items-center">
                                    Date & Time
                                    {getSortIcon('date')}
                                </div>
                            </TableHead>
                            <TableHead className="px-1 py-1.5 w-20 text-center text-sm font-semibold">Reg.</TableHead>
                            <TableHead className="px-1 py-1.5 w-20 text-center text-sm font-semibold">Att.</TableHead>
                            <TableHead className="px-1 py-1.5 w-20 text-center text-sm font-semibold">Watch</TableHead>
                            <TableHead className="px-1 py-1.5 text-right whitespace-nowrap text-sm font-semibold">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {webinars.map((webinar) => (
                            <TableRow key={webinar._id}>
                                <TableCell className="px-1 py-1.5 max-w-[200px] truncate text-sm font-medium">{webinar.name}</TableCell>
                                <TableCell className="px-1 py-1.5">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${webinar.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                        webinar.status === 'In Progress' ? 'bg-green-100 text-green-800' :
                                            webinar.status === 'Ended' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {webinar.status}
                                    </span>
                                </TableCell>
                                <TableCell className="px-1 py-1.5">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${webinar.portalDisplay === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {webinar.portalDisplay}
                                    </span>
                                </TableCell>
                                <TableCell className="px-1 py-1.5 text-sm whitespace-nowrap">{formatDate(webinar.date)}</TableCell>
                                <TableCell className="px-1 py-1.5 text-center text-sm">{getRegistrantsCount(webinar.attendees)}</TableCell>
                                <TableCell className="px-1 py-1.5 text-center text-sm">{getAttendeesCount(webinar.attendees)}</TableCell>
                                <TableCell className="px-1 py-1.5 text-center text-sm">{getReWatchCount(webinar.attendees)}</TableCell>
                                <TableCell className="px-1 py-1.5">
                                    {/* Full buttons for xl screens and above */}
                                    <div className="hidden xl:flex gap-1 justify-end flex-nowrap">
                                        <Button
                                            size="sm"
                                            className="h-8 px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => handlebtnClick('edit', webinar)}
                                            disabled={actionLoading === 'edit'}
                                        >
                                            {actionLoading === 'edit' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Edit'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 px-3 text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                                            onClick={() => handlebtnClick('register', webinar)}
                                            disabled={actionLoading === 'register'}
                                        >
                                            {actionLoading === 'register' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reg'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 px-3 text-sm bg-purple-600 hover:bg-purple-700 text-white"
                                            onClick={() => handlebtnClick('web', webinar)}
                                            disabled={actionLoading === 'web'}
                                        >
                                            {actionLoading === 'web' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Web'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 px-3 text-sm bg-amber-600 hover:bg-amber-700 text-white"
                                            onClick={() => handlebtnClick('host', webinar)}
                                            disabled={actionLoading === 'host'}
                                        >
                                            {actionLoading === 'host' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Host'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 px-3 text-sm bg-teal-600 hover:bg-teal-700 text-white"
                                            onClick={() => handlebtnClick('guest', webinar)}
                                            disabled={actionLoading === 'guest'}
                                        >
                                            {actionLoading === 'guest' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guest'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 px-3 text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                                            onClick={() => handlebtnClick('recs', webinar)}
                                            disabled={actionLoading === 'recs'}
                                        >
                                            {actionLoading === 'recs' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Recs'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => handlebtnClick('delete', webinar)}
                                            disabled={actionLoading === 'delete'}
                                        >
                                            {actionLoading === 'delete' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </div>

                                    {/* Compact dropdown for lg screens */}
                                    <div className="flex xl:hidden gap-1 justify-end">
                                        <Button
                                            size="sm"
                                            className="h-8 px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => handlebtnClick('edit', webinar)}
                                            disabled={actionLoading === 'edit'}
                                        >
                                            {actionLoading === 'edit' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Edit'}
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 border-slate-300 hover:bg-slate-100"
                                                    disabled={actionLoading !== null}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-36">
                                                <DropdownMenuItem onClick={() => handlebtnClick('register', webinar)} className="cursor-pointer">
                                                    <span className="text-emerald-700 font-medium">Register</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlebtnClick('web', webinar)} className="cursor-pointer">
                                                    <span className="text-purple-700 font-medium">Web</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlebtnClick('host', webinar)} className="cursor-pointer">
                                                    <span className="text-amber-700 font-medium">Host</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlebtnClick('guest', webinar)} className="cursor-pointer">
                                                    <span className="text-teal-700 font-medium">Guest</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            size="sm"
                                            className="h-8 px-3 text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                                            onClick={() => handlebtnClick('recs', webinar)}
                                            disabled={actionLoading === 'recs'}
                                        >
                                            {actionLoading === 'recs' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Recs'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => handlebtnClick('delete', webinar)}
                                            disabled={actionLoading === 'delete'}
                                        >
                                            {actionLoading === 'delete' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-3 sm:space-y-4 min-w-0 max-w-full overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
                {webinars.map((webinar) => (
                    <div key={webinar._id} className="bg-white rounded-lg border border-royal-light-gray p-3 shadow-sm min-w-0">
                        <div className="flex items-start justify-between mb-2 min-w-0">
                            <div className="flex-1 min-w-0 mr-2">
                                <h3 className="font-semibold text-royal-dark-gray text-sm sm:text-base mb-1 line-clamp-2">{webinar.name}</h3>
                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-royal-gray mb-2 flex-wrap">
                                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${webinar.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                        webinar.status === 'In Progress' ? 'bg-green-100 text-green-800' :
                                            webinar.status === 'Ended' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {webinar.status}
                                    </span>
                                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${webinar.portalDisplay === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {webinar.portalDisplay === 'Yes' ? 'Visible' : 'Hidden'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1 ml-2 flex-shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlebtnClick('edit', webinar)}
                                    className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                    title="Edit"
                                    disabled={actionLoading === 'edit'}
                                >
                                    {actionLoading === 'edit' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Edit className="h-3 w-3" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlebtnClick('delete', webinar)}
                                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-red-500 hover:bg-red-600"
                                    title="Delete"
                                    disabled={actionLoading === 'delete'}
                                >
                                    {actionLoading === 'delete' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm text-royal-gray mb-2 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <span className="flex items-center gap-1 min-w-0">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="truncate">{formatDate(webinar.date)}</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm text-royal-gray mb-2 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                    <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    {getRegistrantsCount(webinar.attendees)} registrants
                                </span>
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    {getAttendeesCount(webinar.attendees)} attendees
                                </span>
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    {getReWatchCount(webinar.attendees)} re-watch
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-1 flex-wrap min-w-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('register', webinar)}
                                className="text-xs px-2 py-1 h-7 flex-shrink-0"
                            >
                                Register
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('web', webinar)}
                                className="text-xs px-2 py-1 h-7 flex-shrink-0"
                            >
                                Web
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('host', webinar)}
                                className="text-xs px-2 py-1 h-7 flex-shrink-0"
                            >
                                Host
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('guest', webinar)}
                                className="text-xs px-2 py-1 h-7 flex-shrink-0"
                            >
                                Guest
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('recs', webinar)}
                                className="text-xs px-2 py-1 h-7 flex-shrink-0"
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
            <RecsModal isOpen={recsOpen} closeDialog={closeModal} webinar={recsWebinar} onRecordingSaved={fetchWebinars} />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Webinar</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this webinar? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setDeleteDialogOpen(false);
                            setWebinarToDelete(null);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteWebinar}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}