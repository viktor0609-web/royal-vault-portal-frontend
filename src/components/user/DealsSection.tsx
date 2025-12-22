import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import { MultiSelect } from "@/components/ui/multi-select";
import type { MultiSelectOption } from "@/components/ui/multi-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, TagIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { optionsApi, dealApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Option } from "@/services/api/options.service";

const filterConfig = [
  { key: "subCategories", label: "Categories", placeholder: "Categories" },
  { key: "requirements", label: "Requirements", placeholder: "Requirements" },
];

interface FilterOptions {
  subCategories: Option[];
  requirements: Option[];
  sources: Option[];
}

interface Deal {
  _id: string;
  name: string;
  image?: string;
  url?: string;
  category: Array<{ _id: string; name: string }>;
  subCategory: Array<{ _id: string; name: string }>;
  type: Array<{ _id: string; name: string }>;
  strategy: Array<{ _id: string; name: string }>;
  requirement: Array<{ _id: string; name: string }>;
  source: { _id: string; name: string };
  createdBy: { _id: string; name: string };
  updatedAt: string;
  isRoyalVetted?: boolean;
  currentOffering?: "Open" | "Closed" | null;
}

export function DealsSection() {
  const { user } = useAuth();
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesModalUrl, setSalesModalUrl] = useState<string>("https://meetings.hubspot.com/meet-rls/sales-demo-free?embed=true");
  const [activeSourceTab, setActiveSourceTab] = useState<string>("all");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    subCategories: [],
    requirements: [],
    sources: []
  });
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);
  const [starredDealIds, setStarredDealIds] = useState<Set<string>>(new Set());
  const [starringDealId, setStarringDealId] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    subCategories: string[];
    requirements: string[];
    sources: string[];
  }>({
    subCategories: [],
    requirements: [],
    sources: []
  });

  // Fetch filter options once
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFilterOptionsLoading(true);

        const [
          subCategoriesResponse,
          requirementsResponse,
          sourcesResponse
        ] = await Promise.all([
          optionsApi.getSubCategories(),
          optionsApi.getRequirements(),
          optionsApi.getSources()
        ]);

        setFilterOptions({
          subCategories: subCategoriesResponse.data.subCategories || [],
          requirements: requirementsResponse.data.requirements || [],
          sources: sourcesResponse.data.sources || []
        });
      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        setFilterOptionsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch starred deals to know which ones are starred
  useEffect(() => {
    const fetchStarredDeals = async () => {
      if (!user) return;
      try {
        const response = await dealApi.getStarredDeals("basic");
        const starredIds = new Set((response.data.deals || []).map((deal: Deal) => deal._id));
        setStarredDealIds(starredIds);
      } catch (error) {
        console.error("Error fetching starred deals:", error);
      }
    };

    fetchStarredDeals();
  }, [user]);

  // Fetch deals
  const fetchDeals = async (filters = selectedFilters) => {
    try {
      setLoading(true);
      const filterParams: any = {};

      if (filters.subCategories && filters.subCategories.length > 0) {
        filterParams.subCategoryIds = filters.subCategories;
      }
      if (filters.requirements && filters.requirements.length > 0) {
        filterParams.requirementIds = filters.requirements;
      }
      if (filters.sources && filters.sources.length > 0) {
        filterParams.sourceIds = filters.sources;
      }

      let response;

      if (activeSourceTab === "favourite") {
        // Fetch favourite/starred deals
        const savedResponse = await dealApi.getStarredDeals("basic");
        let savedDeals = savedResponse.data.deals || [];

        // Apply filters to saved deals (client-side filtering)
        if (filterParams.subCategoryIds && filterParams.subCategoryIds.length > 0) {
          savedDeals = savedDeals.filter((deal: Deal) =>
            deal.subCategory?.some((sub) => filterParams.subCategoryIds.includes(sub._id))
          );
        }
        if (filterParams.requirementIds && filterParams.requirementIds.length > 0) {
          savedDeals = savedDeals.filter((deal: Deal) =>
            deal.requirement?.some((req) => filterParams.requirementIds.includes(req._id))
          );
        }
        if (filterParams.sourceIds && filterParams.sourceIds.length > 0) {
          savedDeals = savedDeals.filter((deal: Deal) =>
            filterParams.sourceIds.includes(deal.source?._id)
          );
        }

        response = { data: { deals: savedDeals } };
      } else if (activeSourceTab === "royal") {
        // Fetch Royal Vetted deals
        filterParams.isRoyalVetted = "true";
        response = await dealApi.filterDeals(filterParams, "basic", true);
        // Client-side safety filter: ensure only Royal Vetted deals are shown
        if (response.data.deals) {
          response.data.deals = response.data.deals.filter((deal: Deal) => (deal as Deal).isRoyalVetted === true);
        }
      } else {
        // Fetch regular deals (all deals)
        response =
          Object.keys(filterParams).length > 0
            ? await dealApi.filterDeals(filterParams, "basic", true)
            : await dealApi.getAllDeals("basic", true);
      }

      let dealsList = response.data.deals || [];

      // Sort deals: Royal Vetted first, then Royal Sourced, then Client Sourced, then by name
      dealsList.sort((a: Deal, b: Deal) => {
        // First priority: Royal Vetted deals come first
        if (a.isRoyalVetted && !b.isRoyalVetted) return -1;
        if (!a.isRoyalVetted && b.isRoyalVetted) return 1;

        // Get source names (handle null/undefined sources)
        const sourceA = a.source?.name || '';
        const sourceB = b.source?.name || '';

        // Define source priority: Royal Sourced = 0, Client Sourced = 1, others = 2
        const getSourcePriority = (sourceName: string) => {
          if (sourceName === 'Royal Sourced') return 0;
          if (sourceName === 'Client Sourced') return 1;
          return 2;
        };

        const priorityA = getSourcePriority(sourceA);
        const priorityB = getSourcePriority(sourceB);

        // Second priority: sort by source priority
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // If same source priority, sort by name
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setDeals(dealsList);
    } catch (error) {
      console.error("Error fetching deals:", error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Update deals when filters, tab, or user changes
  useEffect(() => {
    fetchDeals();
  }, [selectedFilters, activeSourceTab, user]);

  // Load HubSpot script dynamically when modal opens
  useEffect(() => {
    if (showSalesModal) {
      const script = document.createElement("script");
      script.src = "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
      script.type = "text/javascript";
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [showSalesModal]);

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string[]) => {
    setSelectedFilters({ ...selectedFilters, [filterType]: value });
  };

  // Handle source tab change
  const handleSourceTabChange = (value: string) => {
    setActiveSourceTab(value);
    // Clear source filter when switching tabs
    setSelectedFilters({ ...selectedFilters, sources: [] });
  };

  // Handle star/unstar deal with optimistic updates
  const handleStarToggle = async (dealId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      return;
    }

    if (starringDealId === dealId) {
      return; // Prevent double clicks
    }

    setStarringDealId(dealId);
    const isStarred = starredDealIds.has(dealId);

    // Optimistic update: update UI immediately for instant feedback
    const previousStarredIds = starredDealIds;
    const previousDeals = [...deals]; // Create a copy for potential rollback

    if (isStarred) {
      // Optimistically remove from starred set
      setStarredDealIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(dealId);
        return newSet;
      });
      // If on favourite tab, optimistically remove from deals list
      if (activeSourceTab === "favourite") {
        setDeals((prev) => prev.filter((deal) => deal._id !== dealId));
      }
    } else {
      // Optimistically add to starred set
      setStarredDealIds((prev) => new Set(prev).add(dealId));
      // Note: If on favourite tab, the deal will appear when user refreshes or switches tabs
      // We don't add it here because we'd need to fetch the full deal data
    }

    // Perform API call in background
    try {
      if (isStarred) {
        await dealApi.unstarDeal(dealId);
      } else {
        await dealApi.starDeal(dealId);
      }
    } catch (error) {
      console.error("Error toggling star:", error);
      // Revert optimistic update on error
      setStarredDealIds(previousStarredIds);
      if (activeSourceTab === "favourite") {
        setDeals(previousDeals);
      }
      // Optionally show error toast here
    } finally {
      setStarringDealId(null);
    }
  };

  const formatArrayData = (data: any) => {
    if (!data) return "";
    if (Array.isArray(data)) return data.map((item) => item?.name).join(", ");
    if (typeof data === "object" && data?.name) return data.name;
    return String(data);
  };

  // Check if user has full Elite access
  const hasFullAccess = user?.client_type === "Elite" || user?.email?.toLowerCase().includes('royallegalsolutions.com');

  // Check if deal should show restricted view (Royal Sourced or Client Sourced for non-Elite)
  const isRestrictedDeal = (deal: Deal) => {
    if (hasFullAccess) return false;
    const sourceName = deal.source?.name || '';
    return sourceName === 'Royal Sourced' || sourceName === 'Client Sourced';
  };

  // Handle deal click - Royal Vetted should open meeting scheduler for non-Elite users
  const handleDealClick = (e: React.MouseEvent, deal: Deal) => {
    if (!hasFullAccess && deal.isRoyalVetted) {
      e.preventDefault();
      e.stopPropagation();
      setSalesModalUrl("https://meetings.hubspot.com/allen-lomax/keystone-and-rise-avalon?embed=true");
      setShowSalesModal(true);
    } else if (isRestrictedDeal(deal)) {
      e.preventDefault();
      e.stopPropagation();
      // For restricted deals, the flip card will handle the click
    }
    // For Elite users or deals with full access, allow normal navigation
  };

  const renderFilters = () =>
    filterConfig.map((config) => {
      const options: MultiSelectOption[] = (filterOptions[config.key as keyof typeof filterOptions] || []).map((option: Option) => ({
        label: option.name,
        value: option._id
      }));
      const selected = selectedFilters[config.key as keyof typeof selectedFilters] || [];

      return (
        <div key={config.key} className="space-y-2">
          <label className="text-sm font-semibold text-royal-dark-gray">{config.label}</label>
          <MultiSelect
            options={options}
            selected={selected}
            onChange={(value) => handleFilterChange(config.key, value)}
            placeholder={filterOptionsLoading ? "Loading..." : config.placeholder}
            disabled={filterOptionsLoading}
            className="h-10 border-royal-light-gray hover:border-royal-gray transition-colors"
          />
        </div>
      );
    });

  return (
    <div className="flex flex-col h-full p-2 sm:p-4 animate-in fade-in duration-100">
      {/* Desktop Filters with Source Tabs */}
      <div className="hidden min-[800px]:block bg-white p-4 sm:p-6 rounded-lg border border-royal-light-gray mb-6 sm:mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center w-full sm:w-auto">
            <p className="text-xs sm:text-base text-royal-gray hidden sm:block">Filter by:</p>
            <div className="flex gap-1 sm:gap-2 justify-center w-full sm:w-auto">
              <Button
                variant={activeSourceTab === "all" ? "default" : "outline"}
                size="sm"
                className={`text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 ${activeSourceTab === "all"
                  ? "bg-primary hover:bg-royal-blue-dark text-white"
                  : "border-royal-light-gray text-royal-gray hover:bg-royal-light-gray"
                  }`}
                onClick={() => handleSourceTabChange("all")}
              >
                All
              </Button>
              <Button
                variant={activeSourceTab === "royal" ? "default" : "outline"}
                size="sm"
                className={`text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 ${activeSourceTab === "royal"
                  ? "bg-primary hover:bg-royal-blue-dark text-white"
                  : "border-royal-light-gray text-royal-gray hover:bg-royal-light-gray"
                  }`}
                onClick={() => handleSourceTabChange("royal")}
              >
                Royal
              </Button>
              {user && (
                <Button
                  variant={activeSourceTab === "favourite" ? "default" : "outline"}
                  size="sm"
                  className={`text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 ${activeSourceTab === "favourite"
                    ? "bg-primary hover:bg-royal-blue-dark text-white"
                    : "border-royal-light-gray text-royal-gray hover:bg-royal-light-gray"
                    }`}
                  onClick={() => handleSourceTabChange("favourite")}
                >
                  Saved
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
            {renderFilters()}
          </div>
        </div>
      </div>

      {/* Mobile Filters with Source Tabs Only */}
      <div className="min-[800px]:hidden mb-1.5">
        <div className="flex gap-0.5 bg-white p-0.5 rounded-lg border border-royal-light-gray">
          <Button
            variant={activeSourceTab === "all" ? "default" : "outline"}
            size="sm"
            className={`flex-1 text-xs py-0.5 h-7 ${activeSourceTab === "all"
              ? "bg-primary hover:bg-royal-blue-dark text-white"
              : "border-royal-light-gray text-royal-gray hover:bg-royal-light-gray"
              }`}
            onClick={() => handleSourceTabChange("all")}
          >
            All
          </Button>
          <Button
            variant={activeSourceTab === "royal" ? "default" : "outline"}
            size="sm"
            className={`flex-1 text-xs py-0.5 h-7 ${activeSourceTab === "royal"
              ? "bg-primary hover:bg-royal-blue-dark text-white"
              : "border-royal-light-gray text-royal-gray hover:bg-royal-light-gray"
              }`}
            onClick={() => handleSourceTabChange("royal")}
          >
            Royal
          </Button>
          {user && (
            <Button
              variant={activeSourceTab === "favourite" ? "default" : "outline"}
              size="sm"
              className={`flex-1 text-xs py-0.5 h-7 ${activeSourceTab === "favourite"
                ? "bg-primary hover:bg-royal-blue-dark text-white"
                : "border-royal-light-gray text-royal-gray hover:bg-royal-light-gray"
                }`}
              onClick={() => handleSourceTabChange("favourite")}
            >
              Saved
            </Button>
          )}
        </div>
      </div>

      {/* Deals Grid */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto mb-2 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {loading ? (
              <div className="col-span-full">
                <Loading message="Loading deals..." />
              </div>
            ) : deals.length > 0 ? (
              deals.map((item, index) => {
                const deal = item as Deal;
                const restricted = isRestrictedDeal(deal);
                const isRoyalVetted = deal.isRoyalVetted;

                // For restricted deals (Royal Sourced/Client Sourced for non-Elite), show flip card
                if (restricted) {
                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer block overflow-hidden group relative"
                      style={{ perspective: '1000px' }}
                    >
                      {/* Flip Card Container */}
                      <div
                        className="relative w-full h-56 sm:h-72 group-hover:[transform:rotateY(180deg)] transition-transform duration-[600ms]"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Front of Card - Basic Info (No Image) */}
                        <div
                          className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-t-xl group-hover:pointer-events-none"
                          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                        >
                          {/* Gradient Overlay */}
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                          />

                          {/* Star Button */}
                          {user && (
                            <button
                              onClick={(e) => handleStarToggle(item._id, e)}
                              disabled={starringDealId === item._id}
                              className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                              aria-label={starredDealIds.has(item._id) ? "Unstar deal" : "Star deal"}
                            >
                              <Star
                                className={`h-5 w-5 transition-all ${starredDealIds.has(item._id)
                                  ? "fill-yellow-400 text-yellow-400 scale-110"
                                  : "text-white hover:text-yellow-300"
                                  }`}
                              />
                            </button>
                          )}

                          {/* Deal Name Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10">
                            <h3 className="text-base sm:text-lg lg:text-xl text-white font-bold mb-2 line-clamp-2 drop-shadow-lg">
                              {item.name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {/* Source Tag with color styles */}
                              {item.source?.name && (
                                <div className={`inline-flex items-center px-3 py-1 rounded-full backdrop-blur-sm border shadow-lg ${item.source.name === "Client Sourced"
                                  ? "bg-yellow-500/90 border-yellow-300"
                                  : item.source.name === "Royal Sourced"
                                    ? "bg-blue-500/90 border-blue-300"
                                    : "bg-white/20 border-white/30"
                                  }`}>
                                  <span className="text-xs sm:text-sm text-white font-semibold uppercase tracking-wide">
                                    {item.source.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Back of Card - Membership Message (Shown on Hover) */}
                        <div
                          className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-royal-blue-dark text-white p-6 flex flex-col items-center justify-center rounded-t-xl"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            pointerEvents: 'auto'
                          }}
                        >
                          {/* Star Button on Back */}
                          {user && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleStarToggle(item._id, e);
                              }}
                              disabled={starringDealId === item._id}
                              className="absolute top-3 right-3 z-30 p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg pointer-events-auto"
                              aria-label={starredDealIds.has(item._id) ? "Unstar deal" : "Star deal"}
                            >
                              <Star
                                className={`h-5 w-5 transition-all ${starredDealIds.has(item._id)
                                  ? "fill-yellow-400 text-yellow-400 scale-110"
                                  : "text-white hover:text-yellow-300"
                                  }`}
                              />
                            </button>
                          )}

                          <div className="text-center space-y-4 pointer-events-auto">
                            <h3 className="text-xl sm:text-2xl font-bold mb-2">
                              Deal Club Members Only
                            </h3>
                            <p className="text-sm sm:text-base opacity-90 mb-6">
                              Upgrade to Elite membership to access this deal and view full details.
                            </p>
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSalesModalUrl("https://meetings.hubspot.com/meet-rls/sales-demo-free?embed=true");
                                setShowSalesModal(true);
                              }}
                              className="bg-white text-primary hover:bg-gray-100 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold pointer-events-auto z-30 relative"
                            >
                              TALK TO SALES
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Card Content Below (Always Visible) */}
                      <div className="p-4 sm:p-6 space-y-4">
                        <div className="space-y-3 text-sm">
                          {formatArrayData(item.subCategory) && (
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[80px]">Category:</span>
                              <span className="text-gray-600 dark:text-gray-400 flex-1">{formatArrayData(item.subCategory)}</span>
                            </div>
                          )}
                          {formatArrayData(item.requirement) && (
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[80px]">Requirements:</span>
                              <span className="text-gray-600 dark:text-gray-400 flex-1">{formatArrayData(item.requirement)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // For Royal Vetted or Elite users - show full card
                return (
                  <Link
                    target={hasFullAccess ? "_blank" : undefined}
                    key={index}
                    to={hasFullAccess ? item.url : "#"}
                    onClick={(e) => handleDealClick(e, deal)}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer block overflow-hidden group"
                  >
                    {/* Image Section */}
                    <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-white">
                      <img
                        src={item.image}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        alt={item.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Deal+Image';
                        }}
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                      />

                      {/* Investment Status Tag - Top Left */}
                      {isRoyalVetted && deal.currentOffering && (
                        <div className="absolute top-3 left-3 z-20">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg backdrop-blur-md ${deal.currentOffering === "Open"
                            ? "bg-green-500/95 text-white border border-green-300"
                            : "bg-red-500/95 text-white border border-red-300"
                            }`}>
                            {deal.currentOffering === "Open" ? "Open for Investment" : "Closed for Investment"}
                          </span>
                        </div>
                      )}

                      {/* Star Button */}
                      {user && (
                        <button
                          onClick={(e) => handleStarToggle(item._id, e)}
                          disabled={starringDealId === item._id}
                          className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                          aria-label={starredDealIds.has(item._id) ? "Unstar deal" : "Star deal"}
                        >
                          <Star
                            className={`h-5 w-5 transition-all ${starredDealIds.has(item._id)
                              ? "fill-yellow-400 text-yellow-400 scale-110"
                              : "text-white hover:text-yellow-300"
                              }`}
                          />
                        </button>
                      )}

                      {/* Deal Name Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10">
                        <h3 className="text-base sm:text-lg lg:text-xl text-white font-bold mb-2 line-clamp-2 drop-shadow-lg">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {/* Royal Vetted Tag */}
                          {isRoyalVetted && (
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/90 backdrop-blur-sm border border-purple-300 shadow-lg">
                              <span className="text-xs sm:text-sm text-white font-semibold uppercase tracking-wide">
                                Royal Vetted
                              </span>
                            </div>
                          )}
                          {/* Source Tag with color styles */}
                          {item.source?.name && (
                            <div className={`inline-flex items-center px-3 py-1 rounded-full backdrop-blur-sm border shadow-lg ${item.source.name === "Client Sourced"
                              ? "bg-yellow-500/90 border-yellow-300"
                              : item.source.name === "Royal Sourced"
                                ? "bg-blue-500/90 border-blue-300"
                                : "bg-white/20 border-white/30"
                              }`}>
                              <span className="text-xs sm:text-sm text-white font-semibold uppercase tracking-wide">
                                {item.source.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-6 space-y-4">
                      {/* Deal Details */}
                      <div className="space-y-3 text-sm">
                        {formatArrayData(item.subCategory) && (
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[80px]">Category:</span>
                            <span className="text-gray-600 dark:text-gray-400 flex-1">{formatArrayData(item.subCategory)}</span>
                          </div>
                        )}
                        {formatArrayData(item.requirement) && (
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[80px]">Requirements:</span>
                            <span className="text-gray-600 dark:text-gray-400 flex-1">{formatArrayData(item.requirement)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col justify-center items-center h-48 sm:h-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <TagIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <div className="text-center px-4">
                  <p className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {activeSourceTab === "favourite"
                      ? "No favourite deals yet"
                      : activeSourceTab === "royal"
                        ? "No Royal Vetted deals found"
                        : "No deals found"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {activeSourceTab === "favourite"
                      ? "Star deals to add them to your favourites"
                      : activeSourceTab === "royal"
                        ? "Try adjusting your filters to see more results"
                        : "Try adjusting your filters to see more results"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* HubSpot "Talk to Sales" Modal */}
        <Dialog open={showSalesModal} onOpenChange={setShowSalesModal}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader>
              <DialogTitle className="sr-only">Talk to Sales</DialogTitle>
            </DialogHeader>
            <div
              className="meetings-iframe-container w-full h-full"
              data-src={salesModalUrl}
            ></div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
