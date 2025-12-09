import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TagIcon, FilterIcon, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { optionsApi, dealApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Option } from "@/services/api/options.service";
import type { Deal } from "@/types";

const filterConfig = [
  { key: "categories", label: "Categories", placeholder: "Categories" },
  { key: "subCategories", label: "Sub-Categories", placeholder: "Sub-Categories" },
  { key: "types", label: "Types", placeholder: "Types" },
  { key: "strategies", label: "Strategies", placeholder: "Strategies" },
  { key: "requirements", label: "Requirements", placeholder: "Requirements" },
  { key: "sources", label: "Sources", placeholder: "Sources" },
];

interface FilterOptions {
  categories: Option[];
  subCategories: Option[];
  types: Option[];
  strategies: Option[];
  requirements: Option[];
  sources: Option[];
}


export function DealsSection() {
  const { user } = useAuth();
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    subCategories: [],
    types: [],
    strategies: [],
    requirements: [],
    sources: []
  });
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);
  const [starredDealIds, setStarredDealIds] = useState<Set<string>>(new Set());
  const [loadingStarred, setLoadingStarred] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedFilters, setSelectedFilters] = useState({
    categories: null,
    subCategories: null,
    types: null,
    strategies: null,
    requirements: null,
    sources: null
  });

  // Fetch filter options once
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFilterOptionsLoading(true);

        const [
          categoriesResponse,
          subCategoriesResponse,
          typesResponse,
          strategiesResponse,
          requirementsResponse,
          sourcesResponse
        ] = await Promise.all([
          optionsApi.getCategories(),
          optionsApi.getSubCategories(),
          optionsApi.getTypes(),
          optionsApi.getStrategies(),
          optionsApi.getRequirements(),
          optionsApi.getSources()
        ]);

        setFilterOptions({
          categories: categoriesResponse.data.categories || [],
          subCategories: subCategoriesResponse.data.subCategories || [],
          types: typesResponse.data.types || [],
          strategies: strategiesResponse.data.strategies || [],
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

  // Fetch deals
  const fetchDeals = async (filters = selectedFilters) => {
    try {
      setLoading(true);
      const filterParams: any = {};

      if (filters.categories) filterParams.categoryId = filters.categories;
      if (filters.subCategories) filterParams.subCategoryId = filters.subCategories;
      if (filters.types) filterParams.typeId = filters.types;
      if (filters.strategies) filterParams.strategyId = filters.strategies;
      if (filters.requirements) filterParams.requirementId = filters.requirements;
      if (filters.sources) filterParams.sourceId = filters.sources;

      const response =
        Object.keys(filterParams).length > 0
          ? await dealApi.filterDeals(filterParams, "basic", true)
          : await dealApi.getAllDeals("basic", true);

      setDeals(response.data.deals || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's starred deals
  useEffect(() => {
    const fetchStarredDeals = async () => {
      if (!user) {
        setStarredDealIds(new Set());
        return;
      }

      try {
        setLoadingStarred(true);
        const response = await dealApi.getStarredDeals("basic");
        const starredIds = new Set((response.data.deals || []).map((deal: Deal) => deal._id));
        setStarredDealIds(starredIds);
      } catch (error) {
        console.error("Error fetching starred deals:", error);
        setStarredDealIds(new Set());
      } finally {
        setLoadingStarred(false);
      }
    };

    fetchStarredDeals();
  }, [user]);

  // Update deals when filters change or user authentication state changes
  useEffect(() => {
    fetchDeals();
  }, [selectedFilters, user]);

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
  const handleFilterChange = (filterType: string, value: string | null) => {
    setSelectedFilters({ ...selectedFilters, [filterType]: value });
  };

  const formatArrayData = (data: any) => {
    if (!data) return "";
    if (Array.isArray(data)) return data.map((item) => item?.name).join(", ");
    if (typeof data === "object" && data?.name) return data.name;
    return String(data);
  };

  // Toggle star status
  const handleToggleStar = async (dealId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    const isStarred = starredDealIds.has(dealId);
    const newStarredSet = new Set(starredDealIds);

    // Optimistic update
    if (isStarred) {
      newStarredSet.delete(dealId);
    } else {
      newStarredSet.add(dealId);
    }
    setStarredDealIds(newStarredSet);

    // API call
    try {
      if (isStarred) {
        await dealApi.unstarDeal(dealId);
      } else {
        await dealApi.starDeal(dealId);
      }
    } catch (error) {
      console.error("Error toggling star:", error);
      // Revert on error
      setStarredDealIds(starredDealIds);
    }
  };

  // Organize deals into sections
  const organizedDeals = useMemo(() => {
    const royalVetted = deals.filter((d) => d.isRoyalVetted);
    const allStarred = deals.filter((d) => starredDealIds.has(d._id)); // All starred deals including Royal Vetted
    const regular = deals.filter((d) => !d.isRoyalVetted && !starredDealIds.has(d._id));
    const allDeals = [...deals]; // All deals for "All" tab

    // Sort function: Royal Vetted first, then by source (Royal Sourced > Client Sourced), then starred deals, then by name
    const sortDeals = (dealsList: Deal[]) => {
      return [...dealsList].sort((a, b) => {
        // First priority: Royal Vetted deals come first
        if (a.isRoyalVetted && !b.isRoyalVetted) return -1;
        if (!a.isRoyalVetted && b.isRoyalVetted) return 1;

        // Second priority: Source priority (Royal Sourced > Client Sourced > others)
        const getSourcePriority = (sourceName?: string) => {
          if (sourceName === 'Royal Sourced') return 0;
          if (sourceName === 'Client Sourced') return 1;
          return 2;
        };
        const sourceA = a.source?.name || '';
        const sourceB = b.source?.name || '';
        const priorityA = getSourcePriority(sourceA);
        const priorityB = getSourcePriority(sourceB);
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Third priority: Starred deals come first within same source
        const aStarred = starredDealIds.has(a._id);
        const bStarred = starredDealIds.has(b._id);
        if (aStarred && !bStarred) return -1;
        if (!aStarred && bStarred) return 1;

        // Fourth priority: Sort by name
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    };

    return {
      royalVetted: sortDeals(royalVetted),
      starred: sortDeals(allStarred),
      regular: sortDeals(regular),
      all: sortDeals(allDeals),
    };
  }, [deals, starredDealIds]);

  const renderFilters = () =>
    filterConfig.map((config) => {
      const options = filterOptions[config.key] || [];
      return (
        <div key={config.key}>
          <div className="text-royal-gray mb-1 text-xs font-bold">{config.label}</div>
          <Select
            value={
              selectedFilters[config.key as keyof typeof selectedFilters] || "all"
            }
            onValueChange={(value) =>
              handleFilterChange(config.key, value === "all" ? null : value)
            }
          >
            <SelectTrigger className="border-royal-light-gray h-9 text-xs">
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {filterOptionsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : options.length > 0 ? (
                options.map((option, index) => (
                  <SelectItem key={index} value={option._id}>
                    {option.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options" disabled>
                  No options available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      );
    });

  // Render deal card component
  const renderDealCard = (deal: Deal) => {
    const isStarred = starredDealIds.has(deal._id);
    const hasStarButton = user !== null;
    const hasCurrentOffering = deal.currentOffering !== undefined;

    return (
      <Link
        target="_blank"
        key={deal._id}
        to={deal.url || "#"}
        className="bg-white rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg transition-all duration-200 cursor-pointer block relative group overflow-hidden"
      >
        {/* Star button - Bigger for easier clicking */}
        {hasStarButton && (
          <button
            onClick={(e) => handleToggleStar(deal._id, e)}
            className="absolute top-2 right-2 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors backdrop-blur-sm"
            aria-label={isStarred ? "Unstar deal" : "Star deal"}
            title={isStarred ? "Remove from favourites" : "Add to favourites"}
          >
            <Star
              className={`h-5 w-5 transition-all ${isStarred ? "fill-yellow-400 text-yellow-400" : "text-white"
                }`}
            />
          </button>
        )}

        {/* Current Offering Badge - Only show "Open for Investment", placed in top-left where Royal Vetted badge was */}
        {hasCurrentOffering && deal.currentOffering === "Open" && (
          <div className="absolute top-2 left-2 z-20">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide shadow-lg bg-green-500 text-white">
              Open for Investment
            </span>
          </div>
        )}

        <div className="relative h-48 sm:h-64 w-full">
          <img
            src={deal.image}
            className="w-full h-full object-cover"
            alt={deal.name}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.8))",
            }}
          />
          <h3 className="absolute bottom-6 sm:bottom-8 text-sm sm:text-xl left-2 text-white font-bold z-10 uppercase line-clamp-2">
            {deal.name}
          </h3>
          <div className="text-xs pl-2 sm:pl-3 left-0 right-0 rounded-md absolute bottom-0 m-2 sm:m-3 bg-card uppercase">
            {formatArrayData(deal.type)}
          </div>
        </div>
        <div className="text-xs sm:text-sm text-royal-gray p-3 sm:p-6">
          <div className="leading-relaxed mb-2">
            {deal.source?.name == "Client Sourced" && (
              <span className="inline-block bg-yellow-100 border border-yellow-300 text-yellow-500 px-4 py-0.5 rounded-sm border-2">
                <span className="font-bold uppercase text-xs tracking-wide">
                  {deal.source?.name}
                </span>
              </span>
            )}
            {deal.source?.name == "Royal Sourced" && (
              <span className="inline-block bg-blue-100 border border-blue-300 text-blue-500 px-4 py-0.5 rounded-sm border-2">
                <span className="font-bold uppercase text-xs tracking-wide">
                  {deal.source?.name}
                </span>
              </span>
            )}
          </div>
          <p className="leading-relaxed">
            <span className="font-bold">Category: </span>
            {formatArrayData(deal.category)}
          </p>
          <p className="leading-relaxed">
            <span className="font-bold">Sub-Category: </span>
            {formatArrayData(deal.subCategory)}
          </p>
          <p className="leading-relaxed">
            <span className="font-bold">Strategy: </span>
            {formatArrayData(deal.strategy)}
          </p>
          <p className="leading-relaxed">
            <span className="font-bold">Requirements: </span>
            {formatArrayData(deal.requirement)}
          </p>
        </div>
      </Link>
    );
  };

  // Determine which tab to show based on activeTab
  const getDealsForTab = () => {
    switch (activeTab) {
      case "royal":
        return organizedDeals.royalVetted;
      case "favourites":
        return organizedDeals.starred;
      case "all":
      default:
        return organizedDeals.all;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "royal":
        return "Royal Vetted Deals";
      case "favourites":
        return "My Favourites";
      case "all":
      default:
        return "All Deals";
    }
  };

  const getTabCount = () => {
    switch (activeTab) {
      case "royal":
        return organizedDeals.royalVetted.length;
      case "favourites":
        return organizedDeals.starred.length;
      case "all":
      default:
        return organizedDeals.all.length;
    }
  };

  return (
    <div className="flex flex-col h-full p-2 sm:p-4">
      <div className="bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
        <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <TagIcon className="h-8 w-8 sm:h-12 sm:w-12 text-royal-gray hidden min-[700px]:block flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2">
                DEALS
              </h1>
              <p className="text-xs sm:text-base text-royal-gray">
                Explore our network of asset backed businesses.
              </p>
            </div>
          </div>

          {/* Compact Tabs for Navigation - Positioned on the right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="h-auto p-0.5 bg-gray-100 inline-flex">
                <TabsTrigger
                  value="all"
                  className="text-xs px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  All
                  {organizedDeals.all.length > 0 && (
                    <span className="ml-1 px-1 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">
                      {organizedDeals.all.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="royal"
                  className="text-xs px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  disabled={organizedDeals.royalVetted.length === 0}
                >
                  Royal
                  {organizedDeals.royalVetted.length > 0 && (
                    <span className="ml-1 px-1 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">
                      {organizedDeals.royalVetted.length}
                    </span>
                  )}
                </TabsTrigger>
                {user && (
                  <TabsTrigger
                    value="favourites"
                    className="text-xs px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1"
                    disabled={organizedDeals.starred.length === 0}
                  >
                    <Star className="h-3 w-3" />
                    {organizedDeals.starred.length > 0 && (
                      <span className="px-1 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">
                        {organizedDeals.starred.length}
                      </span>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden min-[800px]:block bg-white p-2 rounded-lg border border-royal-light-gray mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
          {renderFilters()}
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="min-[800px]:hidden mb-3 sm:mb-4">
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 bg-white border-royal-light-gray text-xs sm:text-sm"
            >
              <FilterIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              Filter Deals
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
                <FilterIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                Filter Deals
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-1 py-1">{renderFilters()}</div>
            <div className="flex gap-1 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => setShowFilterModal(false)}
                className="flex-1 text-xs sm:text-sm"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setSelectedFilters({
                    categories: null,
                    subCategories: null,
                    types: null,
                    strategies: null,
                    requirements: null,
                    sources: null
                  });
                  setShowFilterModal(false);
                }}
                className="flex-1 text-xs sm:text-sm"
              >
                Clear All
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Deals Grid */}
      <div className="min-h-0">
        <div className="h-full overflow-y-auto mb-2 rounded-lg">
          {loading || loadingStarred ? (
            <div className="col-span-full">
              <Loading message="Loading deals..." />
            </div>
          ) : (
            <div>
              {/* Section Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-royal-dark-gray mb-4 sm:mb-6">
                {getTabTitle()}
                <span className="ml-2 text-sm sm:text-base font-normal text-royal-gray">
                  ({getTabCount()})
                </span>
              </h2>

              {/* Deals Grid */}
              {getTabCount() > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {getDealsForTab().map((deal) => renderDealCard(deal))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-24 sm:h-32">
                  <div className="text-sm sm:text-base text-royal-gray">
                    {activeTab === "favourites"
                      ? "No favourite deals yet. Star deals to add them here."
                      : activeTab === "royal"
                        ? "No Royal Vetted deals available."
                        : "No deals found matching your filters."}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Overlay for non-logged-in users */}

        {user?.client_type !== "Elite" && !(user?.email?.toLowerCase().includes('royallegalsolutions.com')) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur z-20">
            <div className="text-center text-white max-w-3xl px-3 sm:px-4">
              <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
                Access high performance investments in real estate, oil & gas,
                machinery, and more.
              </h2>
              <p className="text-sm sm:text-xl mb-6 sm:mb-8 opacity-90">
                Discover exclusive investment opportunities from our curated
                network of vetted partners.
              </p>
              <Button
                onClick={() => setShowSalesModal(true)}
                className="bg-primary hover:bg-royal-blue-dark text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-bold"
              >
                TALK TO SALES
              </Button>
            </div>
          </div>
        )}

        {/* HubSpot "Talk to Sales" Modal */}
        <Dialog open={showSalesModal} onOpenChange={setShowSalesModal}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader>
              <DialogTitle className="sr-only">Talk to Sales</DialogTitle>
            </DialogHeader>
            <div
              className="meetings-iframe-container w-full h-full"
              data-src="https://meetings.hubspot.com/meet-rls/sales-demo-free?embed=true"
            ></div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
