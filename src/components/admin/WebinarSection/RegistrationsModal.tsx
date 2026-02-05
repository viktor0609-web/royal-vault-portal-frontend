import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollableTable, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Loader2, Users, Mail, Phone, Calendar, UserCheck, PlayCircle, Clock, Download, RefreshCw } from "lucide-react";
import { webinarApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { WebinarAttendee, User } from "@/types";
import { format } from "date-fns";

interface Webinar {
    _id: string;
    name?: string;
}

interface RegistrationsModalProps {
    isOpen: boolean;
    closeDialog: () => void;
    webinar?: Webinar | null;
}

interface PopulatedAttendee extends Omit<WebinarAttendee, 'user'> {
    user: User;
}

function buildCsvFromAttendees(attendees: PopulatedAttendee[]): string {
    const header = "First Name,Last Name,Email,Phone,Status,Registered At";
    const escape = (v: string) => {
        const s = String(v ?? "").replace(/"/g, '""');
        return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
    };
    const rows = attendees.map((a) => [
        escape(a.user?.firstName ?? ""),
        escape(a.user?.lastName ?? ""),
        escape(a.user?.email ?? ""),
        escape(a.user?.phone ?? ""),
        escape(a.attendanceStatus ?? ""),
        escape(a.registeredAt ?? ""),
    ].join(","));
    return [header, ...rows].join("\n");
}

function downloadCsv(csv: string, filename: string) {
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function RegistrationsModal({ isOpen, closeDialog, webinar }: RegistrationsModalProps) {
    const { toast } = useToast();
    const [attendees, setAttendees] = useState<PopulatedAttendee[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncingHubSpot, setSyncingHubSpot] = useState(false);

    useEffect(() => {
        if (isOpen && webinar?._id) {
            fetchRegistrations();
        } else {
            setAttendees([]);
        }
    }, [isOpen, webinar?._id]);

    const fetchRegistrations = async () => {
        if (!webinar?._id) return;

        try {
            setLoading(true);
            const response = await webinarApi.getWebinarAttendees(webinar._id);
            const fetchedAttendees = response.data.attendees || [];

            // Ensure user is populated (not just an ID)
            const populatedAttendees = fetchedAttendees.map((attendee: any) => ({
                ...attendee,
                user: typeof attendee.user === 'string'
                    ? null
                    : attendee.user
            })).filter((attendee: any) => attendee.user !== null) as PopulatedAttendee[];

            setAttendees(populatedAttendees);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch registrations';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            registered: { label: "Registered", className: "bg-blue-100 text-blue-800", icon: Clock },
            attended: { label: "Attended", className: "bg-green-100 text-green-800", icon: UserCheck },
            watched: { label: "Watched", className: "bg-purple-100 text-purple-800", icon: PlayCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.registered;
        const Icon = config.icon;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.className}`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
        } catch {
            return dateString;
        }
    };

    const registeredCount = attendees.filter(a => a.attendanceStatus === 'registered').length;
    const attendedCount = attendees.filter(a => a.attendanceStatus === 'attended').length;
    const watchedCount = attendees.filter(a => a.attendanceStatus === 'watched').length;

    const handleDownloadCsv = () => {
        if (attendees.length === 0) {
            toast({ title: "No data", description: "No participants to export.", variant: "destructive" });
            return;
        }
        const csv = buildCsvFromAttendees(attendees);
        const safeName = (webinar?.name || webinar?._id || "webinar").replace(/[^a-zA-Z0-9-_]/g, "_");
        downloadCsv(csv, `webinar-participants-${safeName}.csv`);
        toast({ title: "Download started", description: "Participant CSV has been downloaded." });
    };

    const handleSyncToHubSpot = async () => {
        if (!webinar?._id) return;
        setSyncingHubSpot(true);
        try {
            const res = await webinarApi.syncAttendeesToHubSpot(webinar._id);
            const data = res.data as { message?: string; listId?: string; added?: number; removed?: number; totalContacts?: number };
            const msg = data.totalContacts != null
                ? `List synced: ${data.totalContacts} contact(s).${data.added != null && data.added > 0 ? ` ${data.added} added.` : ""}${data.removed != null && data.removed > 0 ? ` ${data.removed} removed.` : ""}`
                : (data.message || "HubSpot list synced.");
            toast({ title: "HubSpot synced", description: msg });
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to sync to HubSpot.";
            toast({ title: "Sync failed", description: msg, variant: "destructive" });
        } finally {
            setSyncingHubSpot(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex flex-col">
                <DialogHeader className="space-y-1 sm:space-y-2">
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="truncate">Webinar Registrations</span>
                    </DialogTitle>
                    <DialogDescription className="line-clamp-2 sm:line-clamp-none">
                        {webinar?.name && (
                            <span className="font-medium text-foreground">{webinar.name}</span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : attendees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">No registrations yet</p>
                        <p className="text-sm text-muted-foreground mt-2">No one has registered for this webinar.</p>
                    </div>
                ) : (
                    <div className="space-y-4 min-w-0 overflow-hidden max-w-full">
                        {/* Actions: Download CSV + Sync to HubSpot */}
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadCsv}
                                className="gap-2 w-full sm:w-auto"
                            >
                                <Download className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">Download CSV</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSyncToHubSpot}
                                disabled={syncingHubSpot || attendees.length === 0}
                                className="gap-2 w-full sm:w-auto"
                            >
                                {syncingHubSpot ? (
                                    <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 flex-shrink-0" />
                                )}
                                <span className="truncate">{syncingHubSpot ? "Syncing…" : "Sync to HubSpot"}</span>
                            </Button>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
                            <div className="text-center min-w-0">
                                <div className="text-xl sm:text-2xl font-bold text-blue-600 tabular-nums">{registeredCount}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground truncate">Registered</div>
                            </div>
                            <div className="text-center min-w-0">
                                <div className="text-xl sm:text-2xl font-bold text-green-600 tabular-nums">{attendedCount}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground truncate">Attended</div>
                            </div>
                            <div className="text-center min-w-0">
                                <div className="text-xl sm:text-2xl font-bold text-purple-600 tabular-nums">{watchedCount}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground truncate">Watched</div>
                            </div>
                        </div>

                        {/* Mobile: card list */}
                        <div className="space-y-2 md:hidden">
                            <p className="text-xs text-muted-foreground font-medium">Participants</p>
                            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                                {attendees.map((attendee, index) => (
                                    <AttendeeCard key={index} attendee={attendee} getStatusBadge={getStatusBadge} formatDate={formatDate} />
                                ))}
                            </div>
                        </div>

                        {/* Desktop: scrollable table with fixed header */}
                        <ScrollableTable maxHeight="50vh" tableClassName="table-fixed min-w-0" className="hidden md:block min-w-0 w-full">
                                <TableHeader>
                                    <TableRow className="bg-muted hover:bg-muted border-b">
                                        <TableHead className="w-[18%] bg-muted">Name</TableHead>
                                        <TableHead className="w-[28%] bg-muted">Email</TableHead>
                                        <TableHead className="w-[14%] bg-muted">Phone</TableHead>
                                        <TableHead className="w-[14%] bg-muted">Status</TableHead>
                                        <TableHead className="w-[26%] bg-muted">Registered At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendees.map((attendee, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium max-w-0">
                                                <span className="block truncate min-w-0" title={`${attendee.user?.firstName ?? ''} ${attendee.user?.lastName ?? ''}`.trim()}>
                                                    {attendee.user?.firstName} {attendee.user?.lastName}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-0">
                                                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                                                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    <span className="text-sm truncate block min-w-0" title={attendee.user?.email || undefined}>{attendee.user?.email || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-0">
                                                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                                                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    <span className="text-sm truncate block min-w-0" title={attendee.user?.phone || undefined}>{attendee.user?.phone || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-0">
                                                <div className="min-w-0 overflow-hidden">{getStatusBadge(attendee.attendanceStatus)}</div>
                                            </TableCell>
                                            <TableCell className="max-w-0">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0 overflow-hidden" title={formatDate(attendee.registeredAt)}>
                                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate block min-w-0">{formatDate(attendee.registeredAt)}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                        </ScrollableTable>

                        {/* Total count */}
                        <div className="text-xs sm:text-sm text-muted-foreground text-center">
                            Total: <span className="font-medium text-foreground">{attendees.length}</span> registration{attendees.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
                    <Button variant="outline" size="sm" className="sm:size-default" onClick={closeDialog}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function AttendeeCard({ attendee, getStatusBadge, formatDate }: { attendee: PopulatedAttendee; getStatusBadge: (s: string) => JSX.Element; formatDate: (s: string) => string }) {
    return (
        <div className="border rounded-lg p-3 sm:p-4 space-y-2 bg-card">
            <div className="font-medium text-sm sm:text-base">
                {attendee.user?.firstName} {attendee.user?.lastName}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <a href={`mailto:${attendee.user?.email}`} className="truncate hover:underline">{attendee.user?.email || 'N/A'}</a>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{attendee.user?.phone || 'N/A'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
                {getStatusBadge(attendee.attendanceStatus)}
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(attendee.registeredAt)}
                </span>
            </div>
        </div>
    );
}
