import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { courseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/client";
import { Search, X } from "lucide-react";
import type { CourseGroup, GroupModalProps } from "@/types";

export function GroupModal({ isOpen, closeDialog, editingGroup, onGroupSaved }: GroupModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        icon: "",
        category: "" as string,
        displayOnPublicPage: true,
        audienceType: "all" as "all" | "hubspotLists",
        hubSpotListIds: [] as string[]
    });
    const [categories, setCategories] = useState<{ _id: string; title: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hubSpotLists, setHubSpotLists] = useState<any[]>([]);
    const [filteredHubSpotLists, setFilteredHubSpotLists] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [loadingLists, setLoadingLists] = useState(false);
    const { toast } = useToast();
    const searchRef = useRef<HTMLDivElement>(null);

    // Fetch HubSpot lists and categories when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchHubSpotLists();
            courseApi.getAllCategories().then((res) => {
                setCategories(res.data.data || []);
            }).catch(() => setCategories([]));
        }
    }, [isOpen]);

    const fetchHubSpotLists = async () => {
        try {
            setLoadingLists(true);
            const { data } = await api.get('/api/promotional-sms-lists');
            const lists = data.lists || [];
            setHubSpotLists(lists);
            setFilteredHubSpotLists(lists);
        } catch (error) {
            console.error('Error fetching HubSpot lists:', error);
            setHubSpotLists([]);
            setFilteredHubSpotLists([]);
        } finally {
            setLoadingLists(false);
        }
    };

    // Filter HubSpot lists based on search query
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredHubSpotLists(hubSpotLists);
        } else {
            const filtered = hubSpotLists.filter((list: any) =>
                list.name?.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredHubSpotLists(filtered);
        }
    };

    // Clear search and reset to all lists
    const clearSearch = () => {
        setSearchQuery('');
        setFilteredHubSpotLists(hubSpotLists);
        setIsSearchOpen(false);
    };

    // Handle clicking outside to close search dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        if (isSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen]);

    // Get list ID helper
    const getListId = (list: any) => {
        return list.objectId || list.listId || list.id || String(list._id || '');
    };

    // Toggle list selection
    const toggleListSelection = (listId: string) => {
        setFormData(prev => {
            const currentIds = prev.hubSpotListIds || [];
            if (currentIds.includes(listId)) {
                // Remove from selection
                return { ...prev, hubSpotListIds: currentIds.filter(id => id !== listId) };
            } else {
                // Add to selection
                return { ...prev, hubSpotListIds: [...currentIds, listId] };
            }
        });
    };

    // Remove selected list
    const removeList = (listId: string) => {
        setFormData(prev => ({
            ...prev,
            hubSpotListIds: (prev.hubSpotListIds || []).filter(id => id !== listId)
        }));
    };

    useEffect(() => {
        if (editingGroup) {
            const editingData = editingGroup as any;
            // Determine audience type - if hubSpotListIds exist, use hubspotLists, otherwise all
            const audienceType = editingData.hubSpotListIds && editingData.hubSpotListIds.length > 0
                ? "hubspotLists"
                : "all";

            const catId = editingData.category?._id ?? editingData.category ?? "";
            setFormData({
                title: editingGroup.title || "",
                description: editingGroup.description || "",
                icon: editingGroup.icon || "",
                category: catId || "",
                displayOnPublicPage: editingData.displayOnPublicPage !== false,
                audienceType: audienceType,
                hubSpotListIds: editingData.hubSpotListIds || []
            });
        } else {
            setFormData({
                title: "",
                description: "",
                icon: "",
                category: "",
                displayOnPublicPage: true,
                audienceType: "all",
                hubSpotListIds: []
            });
        }
    }, [editingGroup, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Transform form data to match backend expectations
            const submitData: any = {
                title: formData.title,
                description: formData.description,
                icon: formData.icon,
                category: formData.category || null,
                displayOnPublicPage: formData.displayOnPublicPage,
            };

            // Only include HubSpot list IDs if displayOnPublicPage is true and audience type is "hubspotLists"
            if (formData.displayOnPublicPage && formData.audienceType === "hubspotLists") {
                submitData.hubSpotListIds = formData.hubSpotListIds;
            } else {
                // Clear HubSpot list IDs if not using lists
                submitData.hubSpotListIds = [];
            }

            let response;
            if (editingGroup) {
                response = await courseApi.updateCourseGroup(editingGroup._id, submitData);
                toast({
                    title: "Success",
                    description: "Course group updated successfully",
                });
            } else {
                response = await courseApi.createCourseGroup(submitData);
                toast({
                    title: "Success",
                    description: "Course group created successfully",
                });
            }
            onGroupSaved(response.data, !!editingGroup);
            closeDialog();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to save course group";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogTitle className="text-xl font-semibold">
                    {editingGroup ? "Edit Course Group" : "Create Course Group"}
                </DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title" className="text-royal-dark-gray font-medium">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            className="mt-1"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description" className="text-royal-dark-gray font-medium">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className="mt-1"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="icon" className="text-royal-dark-gray font-medium">
                            Icon (Iconify class)
                        </Label>
                        <Input
                            id="icon"
                            value={formData.icon}
                            onChange={(e) => handleInputChange("icon", e.target.value)}
                            className="mt-1"
                            placeholder="e.g., material-symbols:school"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="category" className="text-royal-dark-gray font-medium">
                            Section (category)
                        </Label>
                        <Select
                            value={formData.category || "none"}
                            onValueChange={(v) => setFormData(prev => ({ ...prev, category: v === "none" ? "" : v }))}
                        >
                            <SelectTrigger id="category" className="mt-1">
                                <SelectValue placeholder="No section" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No section</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-royal-gray mt-1">Group this course under a section on the main Courses page.</p>
                    </div>

                    {/* Display on Public Pages */}
                    <div className="space-y-4">
                        {/* Audience Selector - Only show when displayOnPublicPage is true */}
                        {formData.displayOnPublicPage && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-royal-dark-gray font-medium mb-2 block">
                                        Audience
                                    </Label>
                                    <Select
                                        value={formData.audienceType}
                                        onValueChange={(value: "all" | "hubspotLists") => {
                                            setFormData(prev => ({
                                                ...prev,
                                                audienceType: value,
                                                // Clear list IDs when switching to "all"
                                                ...(value === "all" ? { hubSpotListIds: [] } : {})
                                            }));
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="hubspotLists">HubSpot Lists</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* HubSpot Lists Searchable Select - Only show when audience type is "hubspotLists" */}
                                {formData.audienceType === "hubspotLists" && (
                                    <div>
                                        <Label className="text-royal-dark-gray font-medium mb-2 block">
                                            Select HubSpot Lists
                                        </Label>
                                        {loadingLists ? (
                                            <div className="text-sm text-royal-gray py-2">
                                                Loading HubSpot lists...
                                            </div>
                                        ) : (
                                            <div className="relative mt-1" ref={searchRef}>
                                                <div className="relative">
                                                    <Input
                                                        type="text"
                                                        placeholder="Search HubSpot lists..."
                                                        value={searchQuery}
                                                        onChange={(e) => handleSearchChange(e.target.value)}
                                                        onFocus={() => setIsSearchOpen(true)}
                                                        className="pr-10"
                                                    />
                                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                </div>

                                                {isSearchOpen && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                                        {filteredHubSpotLists.length > 0 ? (
                                                            filteredHubSpotLists.map((list: any) => {
                                                                const listId = getListId(list);
                                                                const isSelected = formData.hubSpotListIds?.includes(listId) || false;
                                                                return (
                                                                    <div
                                                                        key={listId}
                                                                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between ${isSelected ? 'bg-blue-50' : ''
                                                                            }`}
                                                                        onClick={() => {
                                                                            toggleListSelection(listId);
                                                                        }}
                                                                    >
                                                                        <div className="flex-1">
                                                                            <div className="font-medium text-gray-900">{list.name || 'Unnamed List'}</div>
                                                                            {list.description && (
                                                                                <div className="text-sm text-gray-500">{list.description}</div>
                                                                            )}
                                                                        </div>
                                                                        {isSelected && (
                                                                            <div className="ml-2 text-blue-600">
                                                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="px-3 py-2 text-gray-500 text-center">
                                                                No HubSpot lists found
                                                            </div>
                                                        )}

                                                        {searchQuery && (
                                                            <div className="px-3 py-2 border-t border-gray-200">
                                                                <button
                                                                    type="button"
                                                                    onClick={clearSearch}
                                                                    className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                                                                >
                                                                    <X className="h-4 w-4 mr-1" />
                                                                    Clear search
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Selected Lists Display */}
                                                {formData.hubSpotListIds && formData.hubSpotListIds.length > 0 && (
                                                    <div className="mt-2 space-y-2">
                                                        {formData.hubSpotListIds.map((listId: string) => {
                                                            const list = hubSpotLists.find((l: any) => getListId(l) === listId);
                                                            if (!list) return null;
                                                            return (
                                                                <div key={listId} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                                                                    <span className="text-sm text-gray-700">
                                                                        {list.name || 'Unknown List'}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeList(listId)}
                                                                        className="text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {hubSpotLists.length === 0 && !loadingLists && (
                                            <p className="text-xs text-royal-gray mt-1">
                                                No HubSpot lists available. Please check your HubSpot integration.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="displayOnPublicPage"
                                checked={formData.displayOnPublicPage}
                                onCheckedChange={(checked) => {
                                    const isChecked = checked === true;
                                    setFormData(prev => ({
                                        ...prev,
                                        displayOnPublicPage: isChecked,
                                        // Reset audience settings when unchecking
                                        ...(isChecked ? {} : { audienceType: "all", hubSpotListIds: [] })
                                    }));
                                }}
                            />
                            <Label
                                htmlFor="displayOnPublicPage"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                Display on public pages
                            </Label>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : editingGroup ? "Update" : "Create"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}