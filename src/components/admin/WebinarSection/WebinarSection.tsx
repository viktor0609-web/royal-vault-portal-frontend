import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { TagIcon } from "lucide-react";

const sampleData = [
    {
        webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0
    },
    {
        webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0
    },
    {
        webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0
    },
    {
        webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0
    },
    {
        webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0
    },
    {
        webinar: 'Elite Coaching 09-12-34', status: 'Scheduled', portalDisplay: 'yes', date: '9/30/25 7:00pm', registrants: 2, attendees: 0, reWatch: 0
    },

];
export function WebinarSection() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const closeModal = () => {
        setOpen(false);
    }
    const handlebtnClick = (action, item) => {
        if (action == 'create') {
            setOpen(true);
        } else {
            setOpen(true);
        }
    };

    return (
        <div className="flex-1 p-4 flex flex-col">
            <div className="flex gap-4 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
                <TagIcon className="h-10 w-10 text-royal-gray" />
                <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">Deals</h1>
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
                                    <Button className="w-16" onClick={() => handlebtnClick('edit', item)}>Reg</Button>
                                    <Button className="w-16" onClick={() => handlebtnClick('edit', item)}>Web</Button>
                                    <Button className="w-16" onClick={() => handlebtnClick('edit', item)}>Host</Button>
                                    <Button className="w-16" onClick={() => handlebtnClick('edit', item)}>Guest</Button>
                                    <Button className="w-16" onClick={() => handlebtnClick('edit', item)}>Stats</Button>
                                    <Button className="w-16" onClick={() => handlebtnClick('edit', item)}>Recs</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}