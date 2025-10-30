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
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="w-48 min-w-48 font-semibold text-royal-dark-gray">Deal</TableHead>
                                <TableHead className="hidden md:table-cell w-32 min-w-32 font-semibold text-royal-dark-gray">Sources</TableHead>
                                <TableHead className="hidden lg:table-cell w-32 min-w-32 font-semibold text-royal-dark-gray">Categories</TableHead>
                                <TableHead className="hidden xl:table-cell w-32 min-w-32 font-semibold text-royal-dark-gray">Sub-Categories</TableHead>
                                <TableHead className="hidden xl:table-cell w-32 min-w-32 font-semibold text-royal-dark-gray">Types</TableHead>
                                <TableHead className="hidden 2xl:table-cell w-32 min-w-32 font-semibold text-royal-dark-gray">Strategies</TableHead>
                                <TableHead className="hidden 2xl:table-cell w-32 min-w-32 font-semibold text-royal-dark-gray">Requirements</TableHead>
                                <TableHead className="hidden md:table-cell w-32 min-w-32 font-semibold text-royal-dark-gray">URL</TableHead>
                                <TableHead className="hidden xl:table-cell w-32 min-w-32 font-semibold text-royal-dark-gray">Created</TableHead>
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
                                        <TableCell className="hidden md:table-cell text-gray-700">{deal.source?.name || 'N/A'}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-gray-700">{formatArrayData(deal.category)}</TableCell>
                                        <TableCell className="hidden xl:table-cell text-gray-700">{formatArrayData(deal.subCategory)}</TableCell>
                                        <TableCell className="hidden xl:table-cell text-gray-700">{formatArrayData(deal.type)}</TableCell>
                                        <TableCell className="hidden 2xl:table-cell text-gray-700">{formatArrayData(deal.strategy)}</TableCell>
                                        <TableCell className="hidden 2xl:table-cell text-gray-700">{formatArrayData(deal.requirement)}</TableCell>
                                        <TableCell className="hidden md:table-cell">
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
                                        <TableCell className="hidden xl:table-cell text-sm text-royal-gray">{formatDate(deal.createdAt)}</TableCell>
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
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-royal-light-gray">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-royal-gray mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading deals...</p>
                    </div>
                ) : deals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-royal-light-gray">
                        <TagIcon className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium text-lg mb-2">No deals found</p>
                        <p className="text-sm text-gray-400">Create your first deal to get started!</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {deals.map((deal) => (
                            <div
                                key={deal._id}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                            >
                                {/* Card Header with gradient */}
                                <div className="bg-gradient-to-r from-royal-gray/5 to-blue-50/50 p-5 border-b border-gray-100">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h3 className="font-bold text-royal-dark-gray text-lg leading-tight flex-1">
                                            {deal.name}
                                        </h3>
                                        <div className="flex gap-1.5 flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlebtnClick('edit', deal)}
                                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                                title="Edit deal"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteClick(deal._id, deal.name)}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
                                                title="Delete deal"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Source Badge */}
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Source:</span>
                                        <span className="text-xs font-semibold text-royal-gray">{deal.source?.name || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 space-y-4">
                                    {/* Categories with Tags */}
                                    {deal.category && deal.category.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                                Categories
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {deal.category.map((cat) => (
                                                    <span key={cat._id} className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                                                        {cat.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sub-Categories with Tags */}
                                    {deal.subCategory && deal.subCategory.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                                                Sub-Categories
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {deal.subCategory.map((subCat) => (
                                                    <span key={subCat._id} className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium border border-purple-100">
                                                        {subCat.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Types with Tags */}
                                    {deal.type && deal.type.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                                <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                                                Types
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {deal.type.map((type) => (
                                                    <span key={type._id} className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-100">
                                                        {type.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Strategies with Tags */}
                                    {deal.strategy && deal.strategy.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                Strategies
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {deal.strategy.map((strategy) => (
                                                    <span key={strategy._id} className="inline-flex items-center px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium border border-orange-100">
                                                        {strategy.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Requirements with Tags */}
                                    {deal.requirement && deal.requirement.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                                <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                                                Requirements
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {deal.requirement.map((req) => (
                                                    <span key={req._id} className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium border border-red-100">
                                                        {req.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {deal.url ? (
                                            <a
                                                href={deal.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1.5 hover:underline"
                                            >
                                                <ExternalLinkIcon className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">View Deal</span>
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 text-sm font-medium">No URL</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium flex-shrink-0">{formatDate(deal.createdAt)}</span>
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