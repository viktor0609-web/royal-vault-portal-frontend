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
import { TagIcon, FilterIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { optionsApi, dealApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const filterConfig = [
  { key: "categories", label: "Categories", placeholder: "Categories" },
  { key: "subCategories", label: "Sub-Categories", placeholder: "Sub-Categories" },
  { key: "types", label: "Types", placeholder: "Types" },
  { key: "strategies", label: "Strategies", placeholder: "Strategies" },
  { key: "requirements", label: "Requirements", placeholder: "Requirements" },
  { key: "sources", label: "Sources", placeholder: "Sources" },
];

interface FilterOptions {
  categories: Array<{ id: string; name: string }>;
  subCategories: Array<{ id: string; name: string }>;
  types: Array<{ id: string; name: string }>;
  strategies: Array<{ id: string; name: string }>;
  requirements: Array<{ id: string; name: string }>;
  sources: Array<{ id: string; name: string }>;
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

  // Update deals when filters change
  useEffect(() => {
    fetchDeals();
  }, [selectedFilters]);

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
    <div className="flex-1 p-2 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-4 bg-white p-3 sm:p-6 rounded-lg border border-royal-light-gray mb-2 sm:mb-3">
        <TagIcon className="h-8 w-8 sm:h-12 sm:w-12 text-royal-gray hidden min-[700px]:block" />
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-royal-dark-gray mb-1 sm:mb-2">
            DEALS
          </h1>
          <p className="text-xs sm:text-base text-royal-gray">
            Explore our network of asset backed businesses.
          </p>
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden min-[800px]:block bg-white p-2 sm:p-3 rounded-lg border border-royal-light-gray mb-6 sm:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-4">
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
      <div className="relative h-[500px] sm:h-[660px]">
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
                    <h3 className="absolute bottom-6 sm:bottom-8 text-sm sm:text-xl left-2 text-white font-bold z-10 uppercase line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="text-xs pl-2 sm:pl-3 left-0 right-0 rounded-md absolute bottom-0 m-2 sm:m-3 bg-card uppercase">
                      {formatArrayData(item.type)}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-royal-gray p-3 sm:p-6">
                    <p className="leading-relaxed">
                      {item.source?.name == "Client Sourced" && (
                        <div className="inline-block bg-yellow-100 border border-yellow-300 text-yellow-500 px-4 py-0.5 rounded-sm border-2">
                          <span className="font-bold uppercase text-xs tracking-wide">
                            {item.source?.name}
                          </span>
                        </div>
                      )}
                      {item.source?.name == "Royal Sourced" && (
                        <div className="inline-block bg-blue-100 border border-blue-300 text-blue-500 px-4 py-0.5 rounded-sm border-2">
                          <span className="font-bold uppercase text-xs tracking-wide">
                            {item.source?.name}
                          </span>
                        </div>
                      )}
                    </p>
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
                  No deals found matching your filters.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overlay for non-logged-in users */}

        {user?.client_type !== "Elite" && (
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
