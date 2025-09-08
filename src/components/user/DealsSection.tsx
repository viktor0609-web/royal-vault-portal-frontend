import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components//ui/progress";
import { TagIcon } from "lucide-react";
import { Link } from "react-router-dom";

const filterOptions = [
  { label: "Categories", placeholder: "Categories" },
  { label: "Sub-Categories", placeholder: "Sub-Categories" },
  { label: "Types", placeholder: "Types" },
  { label: "Strategies", placeholder: "Strategies" },
  { label: "Requirements", placeholder: "Requirements" },
  { label: "Source", placeholder: "Source" },
];

const items = [
  {
    image: '/imgs/deals.png',
    title: 'Blue Metric Group',
    source: 'Royal Sourced',
    category: 'Real Estate',
    subCategory: 'RV Parks',
    strategy: 'Cash Flow, Depreciation',
    requirements: 'Accredited Investors',
    url: '#'
  },
  {
    image: '/imgs/deals.png',
    title: 'Blue Metric Group',
    source: 'Royal Sourced',
    category: 'Real Estate',
    subCategory: 'RV Parks',
    strategy: 'Cash Flow, Depreciation',
    requirements: 'Accredited Investors',
    url: '#'
  },
  {
    image: '/imgs/deals.png',
    title: 'Blue Metric Group',
    source: 'Royal Sourced',
    category: 'Real Estate',
    subCategory: 'RV Parks',
    strategy: 'Cash Flow, Depreciation',
    requirements: 'Accredited Investors',
    url: '#'
  },
  {
    image: '/imgs/deals.png',
    title: 'Blue Metric Group',
    source: 'Royal Sourced',
    category: 'Real Estate',
    subCategory: 'RV Parks',
    strategy: 'Cash Flow, Depreciation',
    requirements: 'Accredited Investors',
    url: '#'
  },
  {
    image: '/imgs/deals.png',
    title: 'Blue Metric Group',
    source: 'Royal Sourced',
    category: 'Real Estate',
    subCategory: 'RV Parks',
    strategy: 'Cash Flow, Depreciation',
    requirements: 'Accredited Investors',
    url: '#'
  },
  {
    image: '/imgs/deals.png',
    title: 'Blue Metric Group',
    source: 'Royal Sourced',
    category: 'Real Estate',
    subCategory: 'RV Parks',
    strategy: 'Cash Flow, Depreciation',
    requirements: 'Accredited Investors',
    url: '#'
  },
  {
    image: '/imgs/deals.png',
    title: 'Blue Metric Group',
    source: 'Royal Sourced',
    category: 'Real Estate',
    subCategory: 'RV Parks',
    strategy: 'Cash Flow, Depreciation',
    requirements: 'Accredited Investors',
    url: '#'
  },
  {
    image: '/imgs/deals.png',
    title: 'Blue Metric Group',
    source: 'Royal Sourced',
    category: 'Real Estate',
    subCategory: 'RV Parks',
    strategy: 'Cash Flow, Depreciation',
    requirements: 'Accredited Investors',
    url: '#'
  },
  {
    image: '/imgs/deals.png',
    title: 'Blue Metric Group',
    source: 'Royal Sourced',
    category: 'Real Estate',
    subCategory: 'RV Parks',
    strategy: 'Cash Flow, Depreciation',
    requirements: 'Accredited Investors',
    url: '#'
  },
];

export function DealsSection() {
  const [showSalesModal, setShowSalesModal] = useState(false);

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
          {filterOptions.map((option, index) => (
            <div key={index}>
              <Select>
                <SelectTrigger className="border-royal-light-gray">
                  <SelectValue placeholder={option.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      <div className="relative h-[660px]">
        <div className="rounded-lg h-[500px]">
          <div className="h-full overflow-y-auto  mb-2 ">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-6 mb-12">
              {items.map((item, index) => (
                <Link
                  key={index}
                  to={item.url}
                  className="bg-card rounded-lg border border-royal-light-gray hover:shadow-sm transition-shadow cursor-pointer block"
                >
                  <div className="relative h-64 w-full">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                      alt={item.title}
                    />
                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.8))',
                      }}
                    />
                    <h3 className="absolute bottom-8 text-xl left-2 text-white font-bold z-10 uppercase">
                      {item.title}
                    </h3>
                    <div className="text-xs pl-3 left-0 right-0 rounded-md absolute bottom-0 m-3 bg-card uppercase">
                      syndication
                    </div>
                  </div>
                  <div className="text-sm text-royal-gray p-6">
                    <p className="leading-relaxed">
                      <span className="font-bold">Source: </span>{item.source}
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-bold">Category: </span>{item.category}
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-bold">Sub-Category: </span>{item.subCategory}
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-bold">Strategy: </span>{item.strategy}
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-bold">Requirements: </span>{item.requirements}
                    </p>
                  </div>


                </Link>
              ))}
            </div>
          </div>
          <Progress value={30} />
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
          </Select>
        </div>

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
        </div>
      </div>
    </div>
  );
}