import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
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
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Webinar Registrations
                    </DialogTitle>
                    <DialogDescription>
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
                    <div className="space-y-4">
                        {/* Actions: Download CSV + Sync to HubSpot */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadCsv}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSyncToHubSpot}
                                disabled={syncingHubSpot || attendees.length === 0}
                                className="gap-2"
                            >
                                {syncingHubSpot ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                                {syncingHubSpot ? "Syncing…" : "Sync to HubSpot"}
                            </Button>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{registeredCount}</div>
                                <div className="text-sm text-muted-foreground">Registered</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{attendedCount}</div>
                                <div className="text-sm text-muted-foreground">Attended</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{watchedCount}</div>
                                <div className="text-sm text-muted-foreground">Watched</div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Name</TableHead>
                                        <TableHead className="w-[250px]">Email</TableHead>
                                        <TableHead className="w-[150px]">Phone</TableHead>
                                        <TableHead className="w-[150px]">Status</TableHead>
                                        <TableHead className="w-[200px]">Registered At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendees.map((attendee, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {attendee.user?.firstName} {attendee.user?.lastName}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{attendee.user?.email || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{attendee.user?.phone || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(attendee.attendanceStatus)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(attendee.registeredAt)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Total count */}
                        <div className="text-sm text-muted-foreground text-center">
                            Total: <span className="font-medium text-foreground">{attendees.length}</span> registration{attendees.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={closeDialog}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
