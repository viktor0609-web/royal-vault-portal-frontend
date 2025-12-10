import { useState, useEffect } from "react";
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
import { FilterIcon, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { optionsApi, dealApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Option } from "@/services/api/options.service";

const filterConfig = [
  { key: "categories", label: "Categories", placeholder: "Categories" },
  { key: "subCategories", label: "Sub-Categories", placeholder: "Sub-Categories" },
  { key: "types", label: "Types", placeholder: "Types" },
  { key: "strategies", label: "Strategies", placeholder: "Strategies" },
  { key: "requirements", label: "Requirements", placeholder: "Requirements" },
];

interface FilterOptions {
  categories: Option[];
  subCategories: Option[];
  types: Option[];
  strategies: Option[];
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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeSourceTab, setActiveSourceTab] = useState<string>("all");
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
  const [starringDealId, setStarringDealId] = useState<string | null>(null);
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

      if (filters.categories) filterParams.categoryId = filters.categories;
      if (filters.subCategories) filterParams.subCategoryId = filters.subCategories;
      if (filters.types) filterParams.typeId = filters.types;
      if (filters.strategies) filterParams.strategyId = filters.strategies;
      if (filters.requirements) filterParams.requirementId = filters.requirements;
      if (filters.sources) filterParams.sourceId = filters.sources;

      let response;

      if (activeSourceTab === "favourite") {
        // Fetch favourite/starred deals
        const savedResponse = await dealApi.getStarredDeals("basic");
        let savedDeals = savedResponse.data.deals || [];

        // Apply filters to saved deals (client-side filtering)
        if (filterParams.categoryId) {
          savedDeals = savedDeals.filter((deal: Deal) =>
            deal.category?.some((cat) => cat._id === filterParams.categoryId)
          );
        }
        if (filterParams.subCategoryId) {
          savedDeals = savedDeals.filter((deal: Deal) =>
            deal.subCategory?.some((sub) => sub._id === filterParams.subCategoryId)
          );
        }
        if (filterParams.typeId) {
          savedDeals = savedDeals.filter((deal: Deal) =>
            deal.type?.some((type) => type._id === filterParams.typeId)
          );
        }
        if (filterParams.strategyId) {
          savedDeals = savedDeals.filter((deal: Deal) =>
            deal.strategy?.some((strategy) => strategy._id === filterParams.strategyId)
          );
        }
        if (filterParams.requirementId) {
          savedDeals = savedDeals.filter((deal: Deal) =>
            deal.requirement?.some((req) => req._id === filterParams.requirementId)
          );
        }
        if (filterParams.sourceId) {
          savedDeals = savedDeals.filter((deal: Deal) =>
            deal.source?._id === filterParams.sourceId
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

      setDeals(response.data.deals || []);
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
  const handleFilterChange = (filterType: string, value: string | null) => {
    setSelectedFilters({ ...selectedFilters, [filterType]: value });
  };

  // Handle source tab change
  const handleSourceTabChange = (value: string) => {
    setActiveSourceTab(value);
    // Clear source filter for special tabs (favourite, royal, all)
    if (value === "favourite" || value === "royal" || value === "all") {
      setSelectedFilters({ ...selectedFilters, sources: null });
    } else {
      setSelectedFilters({ ...selectedFilters, sources: value });
    }
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

  const renderFilters = () =>
    filterConfig.map((config) => {
      const options = filterOptions[config.key] || [];
      return (
        <div key={config.key}>
          <div className="text-royal-gray mb-1 font-bold">{config.label}</div>
          <Select
            value={
              selectedFilters[config.key as keyof typeof selectedFilters] || "all"
            }
            onValueChange={(value) =>
              handleFilterChange(config.key, value === "all" ? null : value)
            }
          >
            <SelectTrigger className="border-royal-light-gray">
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

  return (
    <div className="flex flex-col h-full p-2 sm:p-4">
      {/* Desktop Filters with Source Tabs */}
      <div className="hidden min-[800px]:block bg-white p-2 sm:p-3 rounded-lg border border-royal-light-gray mb-6 sm:mb-8">
        <Tabs value={activeSourceTab} onValueChange={handleSourceTabChange} className="w-full">
          <TabsList className="flex flex-wrap w-full mb-4 bg-royal-light-gray">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="royal" className="text-xs sm:text-sm">
              Royal
            </TabsTrigger>
            {user && (
              <TabsTrigger value="favourite" className="text-xs sm:text-sm">
                Favourite
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
              {renderFilters()}
            </div>
          </TabsContent>
          <TabsContent value="royal" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
              {renderFilters()}
            </div>
          </TabsContent>
          {user && (
            <TabsContent value="favourite" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
                {renderFilters()}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Mobile Filters with Source Tabs */}
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
            <Tabs value={activeSourceTab} onValueChange={handleSourceTabChange} className="w-full">
              <TabsList className="flex flex-wrap w-full mb-4 bg-royal-light-gray">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  All
                </TabsTrigger>
                <TabsTrigger value="royal" className="text-xs sm:text-sm">
                  Royal
                </TabsTrigger>
                {user && (
                  <TabsTrigger value="favourite" className="text-xs sm:text-sm">
                    Favourite
                  </TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="all" className="mt-0">
                <div className="space-y-1 py-1">{renderFilters()}</div>
              </TabsContent>
              <TabsContent value="royal" className="mt-0">
                <div className="space-y-1 py-1">{renderFilters()}</div>
              </TabsContent>
              {user && (
                <TabsContent value="favourite" className="mt-0">
                  <div className="space-y-1 py-1">{renderFilters()}</div>
                </TabsContent>
              )}
            </Tabs>
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
                  if (activeSourceTab === "favourite" || activeSourceTab === "royal") {
                    // Keep favourite or royal tab active when clearing filters
                  } else {
                    setActiveSourceTab("all");
                  }
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
      <div className=" min-h-0">
        <div className="h-full overflow-y-auto mb-2 rounded-lg ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
            {loading ? (
              <div className="col-span-full">
                <Loading message="Loading deals..." />
              </div>
            ) : deals.length > 0 ? (
              deals.map((item, index) => (
                <Link
                  target="_blank"
                  key={index}
                  to={item.url}
                  className="bg-card rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow duration-75 cursor-pointer block"
                >
                  <div className="relative h-48 sm:h-64 w-full">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                      alt={item.name}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.8))"
                      }}
                    />
                    {/* Investment Status Tag - Top Left */}
                    {(item as Deal).isRoyalVetted && (item as Deal).currentOffering && (
                      <div className="absolute top-2 left-2 z-20">
                        <span className={`inline-block px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide backdrop-blur-sm ${(item as Deal).currentOffering === "Open"
                          ? "bg-green-500/90 text-white border-2 border-green-300"
                          : "bg-red-500/90 text-white border-2 border-red-300"
                          }`}>
                          {(item as Deal).currentOffering === "Open" ? "Open for Investment" : "Closed for Investment"}
                        </span>
                      </div>
                    )}
                    {/* Star Button */}
                    {user && (
                      <button
                        onClick={(e) => handleStarToggle(item._id, e)}
                        disabled={starringDealId === item._id}
                        className="absolute top-2 right-2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={starredDealIds.has(item._id) ? "Unstar deal" : "Star deal"}
                      >
                        <Star
                          className={`h-5 w-5 transition-all ${starredDealIds.has(item._id)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white hover:text-yellow-300"
                            }`}
                        />
                      </button>
                    )}
                    <h3 className="absolute bottom-6 sm:bottom-8 text-sm sm:text-xl left-2 text-white font-bold z-10 uppercase line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="text-xs pl-2 sm:pl-3 left-0 right-0 rounded-md absolute bottom-0 m-2 sm:m-3 bg-card uppercase">
                      {formatArrayData(item.type)}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-royal-gray p-3 sm:p-6">
                    <div className="leading-relaxed mb-2">
                      {/* Show Royal Vetted tag if deal is Royal Vetted */}
                      {(item as Deal).isRoyalVetted ? (
                        <span className="inline-block bg-purple-100 border border-purple-300 text-purple-600 px-4 py-0.5 rounded-sm border-2">
                          <span className="font-bold uppercase text-xs tracking-wide">
                            Royal Vetted
                          </span>
                        </span>
                      ) : (
                        <>
                          {item.source?.name == "Client Sourced" && (
                            <span className="inline-block bg-yellow-100 border border-yellow-300 text-yellow-500 px-4 py-0.5 rounded-sm border-2">
                              <span className="font-bold uppercase text-xs tracking-wide">
                                {item.source?.name}
                              </span>
                            </span>
                          )}
                          {item.source?.name == "Royal Sourced" && (
                            <span className="inline-block bg-blue-100 border border-blue-300 text-blue-500 px-4 py-0.5 rounded-sm border-2">
                              <span className="font-bold uppercase text-xs tracking-wide">
                                {item.source?.name}
                              </span>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <p className="leading-relaxed">
                      <span className="font-bold">Category: </span>
                      {formatArrayData(item.category)}
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-bold">Sub-Category: </span>
                      {formatArrayData(item.subCategory)}
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-bold">Strategy: </span>
                      {formatArrayData(item.strategy)}
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-bold">Requirements: </span>
                      {formatArrayData(item.requirement)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center h-24 sm:h-32">
                <div className="text-sm sm:text-base text-royal-gray">
                  {activeSourceTab === "favourite"
                    ? "You haven't saved any deals yet. Star deals to add them to your favourites."
                    : activeSourceTab === "royal"
                      ? "No Royal Vetted deals found matching your filters."
                      : "No deals found matching your filters."}
                </div>
              </div>
            )}
          </div>
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
