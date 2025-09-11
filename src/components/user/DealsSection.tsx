import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components//ui/progress";
import { TagIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { optionsApi, dealApi } from "@/lib/api";

const filterConfig = [
  { key: "categories", label: "Categories", placeholder: "Categories" },
  { key: "subCategories", label: "Sub-Categories", placeholder: "Sub-Categories" },
  { key: "types", label: "Types", placeholder: "Types" },
  { key: "strategies", label: "Strategies", placeholder: "Strategies" },
  { key: "requirements", label: "Requirements", placeholder: "Requirements" },
  { key: "sources", label: "Source", placeholder: "Source" },
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
  const [showSalesModal, setShowSalesModal] = useState(false);
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


  // Fetch filter options only once on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFilterOptionsLoading(true);

        // Fetch all filter options in parallel
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
        console.error('Error fetching filter options:', error);
      } finally {
        setFilterOptionsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch deals with current filters
  const fetchDeals = async (filters = selectedFilters) => {
    try {
      setLoading(true);

      // Prepare filter parameters for backend
      const filterParams: any = {};

      if (filters.categories) filterParams.category = filters.categories;
      if (filters.subCategories) filterParams.subCategory = filters.subCategories;
      if (filters.types) filterParams.type = filters.types;
      if (filters.strategies) filterParams.strategy = filters.strategies;
      if (filters.requirements) filterParams.requirement = filters.requirements;
      if (filters.sources) filterParams.source = filters.sources;

      // Use filterDeals API if filters are applied, otherwise get all deals
      const response = Object.keys(filterParams).length > 0
        ? await dealApi.filterDeals(filterParams)
        : await dealApi.getAllDeals();

      setDeals(response.data.deals || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      // Set empty array if API fails - all data comes from backend
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch deals on component mount and when filters change
  useEffect(() => {
    fetchDeals();
  }, [selectedFilters]);

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string | null) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: value
    };
    setSelectedFilters(newFilters);
    // The useEffect will automatically trigger fetchDeals when selectedFilters changes
  };

  // Helper function to format array data for display
  const formatArrayData = (data: Array<{ _id: string; name: string }>) => {
    return data.map(item => item.name).join(', ');
  };

  return (
    <div className="flex-1 p-4">
      <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
        <TagIcon className="h-12 w-12 text-royal-gray" />
        <div>
          <h1 className="text-2xl font-bold text-royal-dark-gray mb-2">DEALS</h1>
          <p className="text-royal-gray">
            Explore our network of asset backed businesses.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-royal-light-gray mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {filterConfig.map((config, index) => {

            const options = filterOptions[config.key] || [];

            console.log(options);


            return (
              <div key={index}>
                <Select
                  value={selectedFilters[config.key as keyof typeof selectedFilters] || "all"}
                  onValueChange={(value) => handleFilterChange(config.key, value === "all" ? null : value)}
                >
                  <SelectTrigger className="border-royal-light-gray">
                    <SelectValue placeholder={config.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptionsLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : options.length > 0 ? (
                      options.map((option) => (
                        <SelectItem key={option.id} value={option._id}>
                          {option.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-options" disabled>No options available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative h-[660px]">
        <div className="rounded-lg ">
          <div className="h-full overflow-y-auto  mb-2 ">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-6 mb-12">
              {loading ? (
                <div className="col-span-full flex justify-center items-center h-32">
                  <div className="text-royal-gray">Loading deals...</div>
                </div>
              ) : deals.length > 0 ? (
                deals.map((item, index) => (
                  <Link
                    key={index}
                    to={item.url}
                    className="bg-card rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow cursor-pointer block"
                  >
                    <div className="relative h-64 w-full">

                      <img
                        src={import.meta.env.VITE_BACKEND_URL + item.image}
                        className="w-full h-full object-cover"
                        alt={item.name}
                      />
                      {/* Gradient overlay */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.8))',
                        }}
                      />
                      <h3 className="absolute bottom-8 text-xl left-2 text-white font-bold z-10 uppercase">
                        {item.name}
                      </h3>
                      <div className="text-xs pl-3 left-0 right-0 rounded-md absolute bottom-0 m-3 bg-card uppercase">
                        {formatArrayData(item.type)}
                      </div>
                    </div>
                    <div className="text-sm text-royal-gray p-6">
                      <p className="leading-relaxed">
                        <span className="font-bold">Source: </span>{item.source.name}
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-bold">Category: </span>{formatArrayData(item.category)}
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-bold">Sub-Category: </span>{formatArrayData(item.subCategory)}
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-bold">Strategy: </span>{formatArrayData(item.strategy)}
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-bold">Requirements: </span>{formatArrayData(item.requirement)}
                      </p>
                    </div>


                  </Link>
                ))
              ) : (
                <div className="col-span-full flex justify-center items-center h-32">
                  <div className="text-royal-gray">No deals found matching your filters.</div>
                </div>
              )}
            </div>
          </div>
          {/* <Progress value={30} />
          <h4 className="font-bold text-xl mt-2 mb-2">
            What best describes you?
          </h4>
          <p className="text-sm mb-4">We customize your pain based on how you earn.</p>
          <Select>
            <SelectTrigger className="border-royal-light-gray">
              <SelectValue placeholder={'Choose an option'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder">Coming Soon</SelectItem>
            </SelectContent>
          </Select> */}
        </div>
        {/* 
        <div className="absolute inset-0 flex items-center justify-center  bg-black/50 backdrop-blur z-20">
          <div className="text-center text-white max-w-3xl px-4">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Access high performance investments in real estate, oil & gas, machinery, and more.
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Discover exclusive investment opportunities from our curated network of vetted partners.
            </p>
            <Button
              onClick={() => setShowSalesModal(true)}
              className="bg-primary hover:bg-royal-blue-dark text-white px-8 py-3 text-lg font-bold"
            >
              TALK TO SALES
            </Button>
          </div>
        </div> */}
      </div>
    </div>
  );
}