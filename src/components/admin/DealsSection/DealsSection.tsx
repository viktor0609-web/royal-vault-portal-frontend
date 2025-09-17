import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { TagIcon, Trash2, Edit } from "lucide-react";
import { CreateDealModal } from "./CreateDealModal";
import { dealApi } from "@/lib/api";

interface Deal {
    _id: string;
    name: string;
    url?: string;
    image?: string;
    category: Array<{ _id: string; name: string }>;
    subCategory: Array<{ _id: string; name: string }>;
    type: Array<{ _id: string; name: string }>;
    strategy: Array<{ _id: string; name: string }>;
    requirement: Array<{ _id: string; name: string }>;
    source: { _id: string; name: string };
    createdBy: { _id: string; name: string };
    createdAt: string;
    updatedAt: string;
}
export function DealsSection() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

    const closeModal = () => {
        setOpen(false);
        setEditingDeal(null);
    }

    const handlebtnClick = (action: string, item?: Deal) => {
        if (action === 'create') {
            setEditingDeal(null);
            setOpen(true);
        } else if (action === 'edit' && item) {
            setEditingDeal(item);
            setOpen(true);
        }
    };

    const handleDelete = async (dealId: string) => {
        if (window.confirm('Are you sure you want to delete this deal?')) {
            try {
                await dealApi.deleteDeal(dealId);
                fetchDeals(); // Refresh the list
            } catch (error) {
                console.error('Error deleting deal:', error);
                setError('Failed to delete deal');
            }
        }
    };

    const fetchDeals = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dealApi.getAllDeals();
            setDeals(response.data.deals || []);
        } catch (error) {
            console.error('Error fetching deals:', error);
            setError('Failed to fetch deals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    const formatArrayData = (data: Array<{ _id: string; name: string }>) => {
        return data.map(item => item.name).join(', ');
    };

    return (
        <div className="flex-1 p-4 flex flex-col">
            <div className="flex gap-4 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
                <TagIcon className="h-10 w-10 text-royal-gray hidden min-[700px]:block" />
                <h1 className="text-2xl font-bold text-royal-dark-gray mb-2 uppercase">Deals</h1>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg border border-royal-light-gray overflow-hidden">
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
                                <Button className="w-24" onClick={() => handlebtnClick('create')}>Create</Button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8">
                                    Loading deals...
                                </TableCell>
                            </TableRow>
                        ) : deals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8">
                                    No deals found. Create your first deal!
                                </TableCell>
                            </TableRow>
                        ) : (
                            deals.map((deal) => (
                                <TableRow key={deal._id}>
                                    <TableCell className="font-medium">{deal.name}</TableCell>
                                    <TableCell>{deal.source?.name || 'N/A'}</TableCell>
                                    <TableCell>{formatArrayData(deal.category)}</TableCell>
                                    <TableCell>{formatArrayData(deal.subCategory)}</TableCell>
                                    <TableCell>{formatArrayData(deal.type)}</TableCell>
                                    <TableCell>{formatArrayData(deal.strategy)}</TableCell>
                                    <TableCell>{formatArrayData(deal.requirement)}</TableCell>
                                    <TableCell>
                                        {deal.url ? (
                                            <a
                                                href={deal.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {deal.url}
                                            </a>
                                        ) : 'N/A'}
                                    </TableCell>
                                    <TableCell className="sticky right-0 bg-white z-10">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlebtnClick('edit', deal)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(deal._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreateDealModal
                isOpen={open}
                closeDialog={closeModal}
                editingDeal={editingDeal}
                onDealSaved={fetchDeals}
            />
        </div>
    );
}