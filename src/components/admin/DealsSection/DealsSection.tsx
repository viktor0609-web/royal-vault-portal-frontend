import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminState } from "@/hooks/useAdminState";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
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
import { TagIcon, Trash2, Edit, PlusIcon, ExternalLinkIcon, AlertTriangle } from "lucide-react";
import { CreateDealModal } from "./CreateDealModal";
import { dealApi } from "@/lib/api";
import { formatDate, formatDateTime } from "@/utils/dateUtils";

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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [dealToDelete, setDealToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteClick = (dealId: string, dealName: string) => {
        setDealToDelete({ id: dealId, name: dealName });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!dealToDelete) return;

        setIsDeleting(true);
        try {
            await dealApi.deleteDeal(dealToDelete.id);
            setDeleteDialogOpen(false);
            setDealToDelete(null);
            fetchDeals(); // Refresh the list
        } catch (error) {
            console.error('Error deleting deal:', error);
            setError('Failed to delete deal');
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setDealToDelete(null);
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
        <div className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col gap-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 lg:p-6 rounded-lg border border-royal-light-gray shadow-sm">
                <div className="flex gap-3 items-center">
                    <div className="flex-shrink-0 p-2 bg-royal-gray/10 rounded-lg">
                        <TagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-royal-gray" />
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-royal-dark-gray">Deals</h1>
                </div>
                <Button
                    onClick={() => handlebtnClick('create')}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                >
                    <PlusIcon className="h-5 w-5 sm:h-4 sm:w-4" />
                    Create New Deal
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-royal-light-gray overflow-hidden shadow-sm">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <Table className="w-full min-w-[1200px]">
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="w-48 min-w-48 font-semibold text-royal-dark-gray">Deal</TableHead>
                                <TableHead className="w-32 min-w-32 font-semibold text-royal-dark-gray">Sources</TableHead>
                                <TableHead className="w-32 min-w-32 font-semibold text-royal-dark-gray">Categories</TableHead>
                                <TableHead className="w-32 min-w-32 font-semibold text-royal-dark-gray">Sub-Categories</TableHead>
                                <TableHead className="w-32 min-w-32 font-semibold text-royal-dark-gray">Types</TableHead>
                                <TableHead className="w-32 min-w-32 font-semibold text-royal-dark-gray">Strategies</TableHead>
                                <TableHead className="w-32 min-w-32 font-semibold text-royal-dark-gray">Requirements</TableHead>
                                <TableHead className="w-32 min-w-32 font-semibold text-royal-dark-gray">URL</TableHead>
                                <TableHead className="w-32 min-w-32 font-semibold text-royal-dark-gray">Created</TableHead>
                                <TableHead className="w-32 min-w-32 text-right font-semibold text-royal-dark-gray">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-gray"></div>
                                            <p className="text-gray-500">Loading deals...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : deals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <TagIcon className="h-12 w-12 text-gray-300" />
                                            <p className="text-gray-500 font-medium">No deals found</p>
                                            <p className="text-sm text-gray-400">Create your first deal to get started!</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                deals.map((deal) => (
                                    <TableRow key={deal._id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="font-medium text-royal-dark-gray">{deal.name}</TableCell>
                                        <TableCell className="text-gray-700">{deal.source?.name || 'N/A'}</TableCell>
                                        <TableCell className="text-gray-700">{formatArrayData(deal.category)}</TableCell>
                                        <TableCell className="text-gray-700">{formatArrayData(deal.subCategory)}</TableCell>
                                        <TableCell className="text-gray-700">{formatArrayData(deal.type)}</TableCell>
                                        <TableCell className="text-gray-700">{formatArrayData(deal.strategy)}</TableCell>
                                        <TableCell className="text-gray-700">{formatArrayData(deal.requirement)}</TableCell>
                                        <TableCell>
                                            {deal.url ? (
                                                <a
                                                    href={deal.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                                                >
                                                    <ExternalLinkIcon className="h-3 w-3" />
                                                    <span className="truncate max-w-[120px]">Link</span>
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-royal-gray">{formatDate(deal.createdAt)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handlebtnClick('edit', deal)}
                                                    className="h-8 w-8 p-0"
                                                    title="Edit deal"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteClick(deal._id, deal.name)}
                                                    className="h-8 w-8 p-0"
                                                    title="Delete deal"
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
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-royal-light-gray">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-royal-gray mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading deals...</p>
                    </div>
                ) : deals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-royal-light-gray">
                        <TagIcon className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium text-lg mb-2">No deals found</p>
                        <p className="text-sm text-gray-400">Create your first deal to get started!</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {deals.map((deal) => (
                            <div
                                key={deal._id}
                                className="bg-white rounded-lg border border-royal-light-gray shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Card Header */}
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-royal-dark-gray text-base sm:text-lg mb-2 leading-tight">
                                                {deal.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="font-medium text-royal-gray">Source:</span>
                                                <span className="truncate">{deal.source?.name || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlebtnClick('edit', deal)}
                                                className="h-9 w-9 p-0 hover:bg-gray-100"
                                                title="Edit deal"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteClick(deal._id, deal.name)}
                                                className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                title="Delete deal"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 space-y-3">
                                    {/* Categories Section */}
                                    <div className="grid gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-semibold text-royal-gray uppercase tracking-wide">Categories</span>
                                            <span className="text-sm text-royal-dark-gray leading-relaxed">
                                                {formatArrayData(deal.category) || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-semibold text-royal-gray uppercase tracking-wide">Sub-Categories</span>
                                            <span className="text-sm text-royal-dark-gray leading-relaxed">
                                                {formatArrayData(deal.subCategory) || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-semibold text-royal-gray uppercase tracking-wide">Types</span>
                                            <span className="text-sm text-royal-dark-gray leading-relaxed">
                                                {formatArrayData(deal.type) || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-gray-100"></div>

                                    {/* Strategies & Requirements Section */}
                                    <div className="grid gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-semibold text-royal-gray uppercase tracking-wide">Strategies</span>
                                            <span className="text-sm text-royal-dark-gray leading-relaxed">
                                                {formatArrayData(deal.strategy) || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-semibold text-royal-gray uppercase tracking-wide">Requirements</span>
                                            <span className="text-sm text-royal-dark-gray leading-relaxed">
                                                {formatArrayData(deal.requirement) || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {deal.url ? (
                                            <a
                                                href={deal.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1.5 hover:underline"
                                            >
                                                <ExternalLinkIcon className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">View URL</span>
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 text-sm">No URL available</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 flex-shrink-0">{formatDate(deal.createdAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateDealModal
                isOpen={open}
                closeDialog={closeModal}
                editingDeal={editingDeal}
                onDealSaved={fetchDeals}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <AlertDialogTitle className="text-xl">Delete Deal</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-base">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-royal-dark-gray">
                                "{dealToDelete?.name || 'this deal'}"
                            </span>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelDelete} disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}