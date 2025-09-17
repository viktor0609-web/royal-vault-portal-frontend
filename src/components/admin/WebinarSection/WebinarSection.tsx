import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { ReceiptRussianRuble, VideoIcon } from "lucide-react";
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
        <div className="flex-1 p-4 flex flex-col animate-in fade-in duration-300">
            <div className="flex gap-4 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
                <VideoIcon className="h-10 w-10 text-royal-gray hidden min-[700px]:block" />
                <h1 className="text-2xl font-bold text-royal-dark-gray mb-2 uppercase">Webinars</h1>
            </div>
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-64">Webinar</TableHead>
                        <TableHead className="w-48">Status</TableHead>
                        <TableHead className="w-48">PortalDisplay</TableHead>
                        <TableHead className="w-48">Date EST</TableHead>
                        <TableHead className="w-48">Registrants</TableHead>
                        <TableHead className="w-48">Attendees</TableHead>
                        <TableHead className="w-48">Re-Watch</TableHead>
                        <TableHead className="sticky right-0 bg-white z-10">
                            <Button className="w-[470px]" onClick={() => handlebtnClick('create', '')}>Create</Button>
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
                            <TableCell className="sticky right-0 bg-white z-10 pt-0 pb-0">
                                <div className="flex gap-1">
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
            <WebinarModal isOpen={open} closeDialog={closeModal} />
            <RecsModal isOpen={recsOpen} closeDialog={closeModal} />
        </div>
    );
}