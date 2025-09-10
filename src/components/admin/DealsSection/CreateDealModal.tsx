import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { api } from "@/lib/api";


const multiSelectFields = [
  { title: 'Categories', id: 'categories', placeholder: 'Choose some options' },
  { title: 'Sub-Categories', id: 'subCategories', placeholder: 'Choose some options' },
  { title: 'Types', id: 'types', placeholder: 'Choose some options' },
  { title: 'Strategies', id: 'strategies', placeholder: 'Choose some options' },
  { title: 'Requirements', id: 'requirements', placeholder: 'Choose some options' },
];

const singleSelectFields = [
  { title: 'Source', id: 'source', placeholder: 'Choose an option' },
];

const inputFields = [
  { title: 'Name', id: 'name', placeholder: 'The "New-Rich" Loophole To Pay 0-10% In Tax(Legally|)', type: 'input' },
  { title: 'URL', id: 'url', placeholder: 'www.dealwebsite.com', type: 'input' },
  { title: 'Image', id: 'image', placeholder: 'Image', type: 'file' },
];

export function CreateDealModal({ isOpen, closeDialog }) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    categories: [],
    subCategories: [],
    types: [],
    strategies: [],
    requirements: [],
    image: "",
    source: "",
  });

  const [options, setOptions] = useState({
    categories: [],
    subCategories: [],
    types: [],
    strategies: [],
    requirements: [],
    sources: [],
  });

  const [loading, setLoading] = useState(false);

  // Fetch options when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const [categoriesRes, subCategoriesRes, typesRes, strategiesRes, requirementsRes, sourcesRes] = await Promise.all([
        api.get('/api/categories'),
        api.get('/api/subcategories'),
        api.get('/api/types'),
        api.get('/api/strategies'),
        api.get('/api/requirements'),
        api.get('/api/sources'),
      ]);

      setOptions({
        categories: categoriesRes.data.map((item: any) => ({ label: item.name, value: item._id })),
        subCategories: subCategoriesRes.data.map((item: any) => ({ label: item.name, value: item._id })),
        types: typesRes.data.map((item: any) => ({ label: item.name, value: item._id })),
        strategies: strategiesRes.data.map((item: any) => ({ label: item.name, value: item._id })),
        requirements: requirementsRes.data.map((item: any) => ({ label: item.name, value: item._id })),
        sources: sourcesRes.data.map((item: any) => ({ label: item.name, value: item._id })),
      });
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Transform formData to match backend expectations
      const dealData = {
        ...formData,
        category: formData.categories,
        subCategory: formData.subCategories,
        type: formData.types,
        strategy: formData.strategies,
        requirement: formData.requirements,
      };
      delete dealData.categories;
      delete dealData.subCategories;
      delete dealData.types;
      delete dealData.strategies;
      delete dealData.requirements;

      await api.post('/api/deals', dealData);
      console.log("Deal created successfully:", dealData);
      closeDialog();
      // Reset form
      setFormData({
        name: "",
        url: "",
        categories: [],
        subCategories: [],
        types: [],
        strategies: [],
        requirements: [],
        image: "",
        source: "",
      });
    } catch (error) {
      console.error('Error creating deal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: string, selectedValues: string[]) => {
    setFormData(prev => ({ ...prev, [field]: selectedValues }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Fields */}
          {inputFields.map((item) => (
            <div key={item.id}>
              <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                {item.title}
              </Label>
              <Input
                id={item.id}
                placeholder={item.placeholder}
                value={formData[item.id as keyof typeof formData] as string}
                onChange={(e) => handleInputChange(item.id, e.target.value)}
                className="mt-1"
                required
                type={item.type === 'file' ? 'file' : 'text'}
              />
            </div>
          ))}

          {/* Multi-Select Fields */}
          {multiSelectFields.map((item) => (
            <div key={item.id}>
              <Label className="text-royal-dark-gray font-medium">
                {item.title}
              </Label>
              <MultiSelect
                options={options[item.id as keyof typeof options] as MultiSelectOption[]}
                selected={formData[item.id as keyof typeof formData] as string[]}
                onChange={(selected) => handleMultiSelectChange(item.id, selected)}
                placeholder={item.placeholder}
                className="mt-1"
                disabled={loading}
              />
            </div>
          ))}

          {/* Single Select Fields */}
          {singleSelectFields.map((item) => (
            <div key={item.id}>
              <Label className="text-royal-dark-gray font-medium">
                {item.title}
              </Label>
              <Select
                value={formData[item.id as keyof typeof formData] as string}
                onValueChange={(value) => handleInputChange(item.id, value)}
                disabled={loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={item.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options[item.id === 'source' ? 'sources' : item.id as keyof typeof options]?.map((option: MultiSelectOption) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}