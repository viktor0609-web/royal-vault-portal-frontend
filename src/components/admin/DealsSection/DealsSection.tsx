import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminState } from "@/hooks/useAdminState";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { TagIcon, Trash2, Edit, PlusIcon, ExternalLinkIcon } from "lucide-react";
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

    // Use admin state management
    const {
        state: deals,
        setState: setDeals,
        isLoading: loading,
        error,
        setError
    } = useAdminState<Deal[]>([], 'deals');

    const [open, setOpen] = useState(false);
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
            setError(null);
            // Use 'full' fields for admin view to show all details
            const response = await dealApi.getAllDeals('full');
            setDeals(response.data.deals || []);
        } catch (error) {
            console.error('Error fetching deals:', error);
            setError('Failed to fetch deals');
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    const formatArrayData = (data: Array<{ _id: string; name: string }>) => {
        return data.map(item => item.name).join(', ');
    };

    return (
        <div className="flex-1 p-1 sm:p-2 lg:p-4 flex flex-col">
            <div className="flex gap-2 items-center bg-white p-3 sm:p-4 lg:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
                <TagIcon className="h-6 w-6 sm:h-8 sm:w-8 text-royal-gray hidden sm:block" />
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-royal-dark-gray uppercase">Deals</h1>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-royal-light-gray overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="text-xs text-gray-500 text-center py-2 bg-gray-50 border-b border-gray-200 sm:hidden">
                    ← Scroll horizontally to see all columns →
                </div>
                <Table className="w-full min-w-[1200px] text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-48 min-w-48">Deal</TableHead>
                            <TableHead className="w-32 min-w-32">Source</TableHead>
                            <TableHead className="w-32 min-w-32">Categories</TableHead>
                            <TableHead className="w-32 min-w-32">Subcategories</TableHead>
                            <TableHead className="w-32 min-w-32">Types</TableHead>
                            <TableHead className="w-32 min-w-32">Strategies</TableHead>
                            <TableHead className="w-32 min-w-32">Requirements</TableHead>
                            <TableHead className="w-32 min-w-32">URL</TableHead>
                            <TableHead className="w-32 min-w-32 text-right">
                                <Button className="w-20 sm:w-24 text-xs sm:text-sm" onClick={() => handlebtnClick('create')}>Create</Button>
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
                                    <TableCell className="w-40 min-w-40">
                                        <div className="flex gap-2 justify-end">
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

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
                {/* Add Button for Mobile */}
                <div className="flex justify-end">
                    <Button onClick={() => handlebtnClick('create')} className="flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" />
                        Create
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading deals...</div>
                ) : deals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No deals found. Create your first deal!
                    </div>
                ) : (
                    deals.map((deal) => (
                        <div key={deal._id} className="bg-white rounded-lg border border-royal-light-gray p-3 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-royal-dark-gray text-base sm:text-lg mb-1">{deal.name}</h3>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-royal-gray mb-2">
                                        <span className="font-medium">Source:</span>
                                        <span>{deal.source?.name || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlebtnClick('edit', deal)}
                                        className="h-7 w-7 p-0"
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(deal._id)}
                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2 mb-3">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-royal-gray">Categories:</span>
                                    <span className="text-xs text-royal-dark-gray">{formatArrayData(deal.category) || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-royal-gray">Subcategories:</span>
                                    <span className="text-xs text-royal-dark-gray">{formatArrayData(deal.subCategory) || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-royal-gray">Types:</span>
                                    <span className="text-xs text-royal-dark-gray">{formatArrayData(deal.type) || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-3">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-royal-gray">Strategies:</span>
                                    <span className="text-xs text-royal-dark-gray">{formatArrayData(deal.strategy) || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-royal-gray">Requirements:</span>
                                    <span className="text-xs text-royal-dark-gray">{formatArrayData(deal.requirement) || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs sm:text-sm text-royal-gray">
                                <div className="flex items-center gap-3">
                                    {deal.url ? (
                                        <a
                                            href={deal.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <ExternalLinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="hidden sm:inline">View URL</span>
                                            <span className="sm:hidden">URL</span>
                                        </a>
                                    ) : (
                                        <span className="text-royal-gray">No URL</span>
                                    )}
                                </div>
                                <span className="text-xs">{deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    ))
                )}
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