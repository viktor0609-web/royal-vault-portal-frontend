import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { TagIcon } from "lucide-react";
import { CreateDealModal } from "./CreateDealModal";

const sampleData = [
    {
        id: 1, deal: 'VMD Investing', source: 'Real Estate', categories: 'Real Estate', subCategories: 'Multi-Family',
        types: '', strategies: 'Cash Flow', requirements: 'Real Estate Professional', url: 'https://www.vmdinvesting.com'
    },
    {
        id: 2, deal: 'Accountable Equity', source: 'Machinery', categories: 'Real Estate', subCategories: 'Multi-Family',
        types: 'Syndication', strategies: 'Cash Flow', requirements: 'Real Estate Professional', url: 'https://www.vmdinvesting.com'
    },
    {
        id: 3, deal: 'VMD Investing', source: 'Real Estate', categories: 'Real Estate', subCategories: 'Multi-Family',
        types: '', strategies: 'Cash Flow', requirements: 'Real Estate Professional', url: 'https://www.vmdinvesting.com'
    },
    {
        id: 4, deal: 'Accountable Equity', source: 'Machinery', categories: 'Real Estate', subCategories: 'Multi-Family',
        types: 'Syndication', strategies: 'Cash Flow', requirements: 'Real Estate Professional', url: 'https://www.vmdinvesting.com'
    },
    {
        id: 5, deal: 'VMD Investing', source: 'Real Estate', categories: 'Real Estate', subCategories: 'Multi-Family',
        types: '', strategies: 'Cash Flow', requirements: 'Real Estate Professional', url: 'https://www.vmdinvesting.com'
    },
    {
        id: 6, deal: 'Accountable Equity', source: 'Machinery', categories: 'Real Estate', subCategories: 'Multi-Family',
        types: 'Syndication', strategies: 'Cash Flow', requirements: 'Real Estate Professional', url: 'https://www.vmdinvesting.com'
    },
];
export function DealsSection() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const closeModal = () => {
        setOpen(false);
    }
    const handlebtnClick = (action, item) => {
        if(action == 'create'){
            setOpen(true);
        } else{
            setOpen(true);
        }
    };

    return (
        <div className="flex-1 p-4 flex flex-col">
            <div className="flex gap-4 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
                <TagIcon className="h-10 w-10 text-royal-gray" />
                <h1 className="text-2xl font-bold text-royal-dark-gray mb-2 uppercase">Deals</h1>
            </div>
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-64">Deal</TableHead>
                        <TableHead className="w-48">Source</TableHead>
                        <TableHead className="w-48">Categories</TableHead>
                        <TableHead className="w-48">Subcategories</TableHead>
                        <TableHead className="w-48">Types</TableHead>
                        <TableHead className="w-48">Strategies</TableHead>
                        <TableHead className="w-48">Requirements</TableHead>
                        <TableHead className="w-48">URL</TableHead>
                        <TableHead className="sticky right-0 bg-white z-10">
                            <Button className="w-24" onClick={() => handlebtnClick('create', '')}>Create</Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sampleData.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.deal}</TableCell>
                            <TableCell>{item.source}</TableCell>
                            <TableCell>{item.categories}</TableCell>
                            <TableCell>{item.subCategories}</TableCell>
                            <TableCell>{item.types}</TableCell>
                            <TableCell>{item.strategies}</TableCell>
                            <TableCell>{item.requirements}</TableCell>
                            <TableCell>{item.url}</TableCell>
                            <TableCell className="sticky right-0 bg-white z-10">
                                <Button className="w-24" onClick={() => handlebtnClick('edit', item)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <CreateDealModal isOpen={open} closeDialog={closeModal}/>
        </div>
    );
}