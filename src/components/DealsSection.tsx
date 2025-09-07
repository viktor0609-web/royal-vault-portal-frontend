import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagIcon } from "lucide-react";
import investmentHeroBg from "@/assets/investment-hero-bg.jpg";

const filterOptions = [
  { label: "Categories", placeholder: "Categories" },
  { label: "Sub-Categories", placeholder: "Sub-Categories" },
  { label: "Types", placeholder: "Types" },
  { label: "Strategies", placeholder: "Strategies" },
  { label: "Requirements", placeholder: "Requirements" },
  { label: "Source", placeholder: "Source" },
];

export function DealsSection() {
  const [showSalesModal, setShowSalesModal] = useState(false);

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <TagIcon className="h-12 w-12 text-royal-gray" />
          <div>
            <h1 className="text-3xl font-bold text-royal-dark-gray mb-2">DEALS</h1>
            <p className="text-royal-gray">
              Explore our network of asset backed businesses.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
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

        <div 
          className="relative h-96 rounded-lg overflow-hidden mb-8"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${investmentHeroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
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

        <div className="text-center text-royal-gray">
          <p className="text-lg">More investment opportunities coming soon.</p>
          <p className="text-sm mt-2">Join our community to get early access to exclusive deals.</p>
        </div>
      </div>
    </div>
  );
}