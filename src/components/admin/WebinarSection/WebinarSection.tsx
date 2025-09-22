import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { ReceiptRussianRuble, VideoIcon, Users, Eye, Edit, BarChart3, Calendar, UserCheck } from "lucide-react";
import { WebinarModal } from "./WebinarModal";
import { RecsModal } from "./RecsModal";

const sampleData = [
    { webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0 },
    { webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0 },
    { webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0 },
    { webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0 },
    { webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0 },
    { webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0 },
    { webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0 },

];
export function WebinarSection() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [recsOpen, setRecsOpen] = useState(false);

    const closeModal = () => {
        setOpen(false);
        setRecsOpen(false);
    }
    const handlebtnClick = (action, item) => {

        switch (action) {
            case 'create': {
                setOpen(true);
                return;
            }
            case 'edit': {
                setOpen(true);
                return;
            }
            case 'reg': {
                window.open(`https://royal-vault-nu.vercel.app/registration?title=${item.webinar}`, '_blank');
                return;
            }
            case 'web': {
                window.open(`https://royal-vault-nu.vercel.app/webinar_admin`, '_blank');
                return;
            }
            case 'host': {
                window.open(`https://royal-vault-nu.vercel.app/webinar_host`, '_blank');
                return;
            }
            case 'guest': {
                window.open(`https://royal-vault-nu.vercel.app/webinar_guest`, '_blank');
                return;
            }
            case 'stats': {
                navigate(`/admin/webinar_stats?title=${item.webinar}`)
                return;
            }
            case 'recs': {
                setRecsOpen(true);
                return;
            }
        }
    };

    return (
        <div className="flex-1 p-1 sm:p-2 lg:p-4 flex flex-col animate-in fade-in duration-100">
            <div className="flex gap-2 items-center bg-white p-3 sm:p-4 lg:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
                <VideoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-royal-gray hidden sm:block" />
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-royal-dark-gray uppercase">Webinars</h1>
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
                                <Button className="w-20 sm:w-24 text-xs sm:text-sm" onClick={() => handlebtnClick('create', '')}>Create</Button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sampleData.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.webinar}</TableCell>
                                <TableCell>{item.status}</TableCell>
                                <TableCell>{item.portalDisplay}</TableCell>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>{item.registrants}</TableCell>
                                <TableCell>{item.attendees}</TableCell>
                                <TableCell>{item.reWatch}</TableCell>
                                <TableCell className="w-96 min-w-96">
                                    <div className="flex gap-1 justify-end">
                                        <Button className="w-16" onClick={() => handlebtnClick('edit', item)}>Edit</Button>
                                        <Button className="w-16" onClick={() => handlebtnClick('reg', item)}>Reg</Button>
                                        <Button className="w-16" onClick={() => handlebtnClick('web', item)}>Web</Button>
                                        <Button className="w-16" onClick={() => handlebtnClick('host', item)}>Host</Button>
                                        <Button className="w-16" onClick={() => handlebtnClick('guest', item)}>Guest</Button>
                                        <Button className="w-16" onClick={() => handlebtnClick('stats', item)}>Stats</Button>
                                        <Button className="w-16" onClick={() => handlebtnClick('recs', item)}>Recs</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
                {/* Add Button for Mobile */}
                <div className="flex justify-end">
                    <Button onClick={() => handlebtnClick('create', '')} className="flex items-center gap-2">
                        <VideoIcon className="h-4 w-4" />
                        Create Webinar
                    </Button>
                </div>

                {sampleData.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg border border-royal-light-gray p-3 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h3 className="font-semibold text-royal-dark-gray text-base sm:text-lg mb-1">{item.webinar}</h3>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-royal-gray mb-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Scheduled'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {item.status}
                                    </span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                        {item.portalDisplay === 'yes' ? 'Visible' : 'Hidden'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlebtnClick('edit', item)}
                                    className="h-7 w-7 p-0"
                                    title="Edit"
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlebtnClick('stats', item)}
                                    className="h-7 w-7 p-0"
                                    title="Stats"
                                >
                                    <BarChart3 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm text-royal-gray mb-2">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {item.date}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm text-royal-gray mb-2">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {item.registrants} registrants
                                </span>
                                <span className="flex items-center gap-1">
                                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {item.attendees} attendees
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {item.reWatch} re-watch
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-1 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('reg', item)}
                                className="text-xs px-2 py-1"
                            >
                                Reg
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('web', item)}
                                className="text-xs px-2 py-1"
                            >
                                Web
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('host', item)}
                                className="text-xs px-2 py-1"
                            >
                                Host
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('guest', item)}
                                className="text-xs px-2 py-1"
                            >
                                Guest
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlebtnClick('recs', item)}
                                className="text-xs px-2 py-1"
                            >
                                Recs
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <WebinarModal isOpen={open} closeDialog={closeModal} />
            <RecsModal isOpen={recsOpen} closeDialog={closeModal} />
        </div>
    );
}