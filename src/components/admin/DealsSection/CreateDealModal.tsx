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
import { dealApi, optionsApi, imageApi } from "@/lib/api";


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

interface CreateDealModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  editingDeal?: any;
  onDealSaved?: () => void;
}

export function CreateDealModal({ isOpen, closeDialog, editingDeal, onDealSaved }: CreateDealModalProps) {
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

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [options, setOptions] = useState({
    categories: [],
    subCategories: [],
    types: [],
    strategies: [],
    requirements: [],
    sources: [],
  });

  const [loading, setLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Fetch options when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editingDeal) {
      setFormData({
        name: editingDeal.name || "",
        url: editingDeal.url || "",
        categories: editingDeal.category?.map((cat: any) => cat._id) || [],
        subCategories: editingDeal.subCategory?.map((sub: any) => sub._id) || [],
        types: editingDeal.type?.map((type: any) => type._id) || [],
        strategies: editingDeal.strategy?.map((strategy: any) => strategy._id) || [],
        requirements: editingDeal.requirement?.map((req: any) => req._id) || [],
        image: editingDeal.image || "",
        source: editingDeal.source?._id || "",
      });
      setImageFile(null);
    } else {
      // Reset form for new deal
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
      setImageFile(null);
    }
  }, [editingDeal, isOpen]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setOptionsError(null);
      const [categoriesRes, subCategoriesRes, typesRes, strategiesRes, requirementsRes, sourcesRes] = await Promise.all([
        optionsApi.getCategories(),
        optionsApi.getSubCategories(),
        optionsApi.getTypes(),
        optionsApi.getStrategies(),
        optionsApi.getRequirements(),
        optionsApi.getSources(),
      ]);

      console.log(categoriesRes.data.categories);


      const optionsData = {
        categories: categoriesRes.data.categories.map((item: any) => ({ label: item.name, value: item._id })),
        subCategories: subCategoriesRes.data.subCategories.map((item: any) => ({ label: item.name, value: item._id })),
        types: typesRes.data.types.map((item: any) => ({ label: item.name, value: item._id })),
        strategies: strategiesRes.data.strategies.map((item: any) => ({ label: item.name, value: item._id })),
        requirements: requirementsRes.data.requirements.map((item: any) => ({ label: item.name, value: item._id })),
        sources: sourcesRes.data.sources.map((item: any) => ({ label: item.name, value: item._id })),
      };

      console.log(
        optionsData
      );


      setOptions(optionsData);
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptionsError('Failed to load options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      let imageUrl = formData.image;

      // Upload image if a new file is selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Transform formData to match backend expectations
      const dealData = {
        name: formData.name,
        url: formData.url,
        image: imageUrl,
        categoryIds: formData.categories,
        subCategoryIds: formData.subCategories,
        typeIds: formData.types,
        strategyIds: formData.strategies,
        requirementIds: formData.requirements,
        sourceId: formData.source,
        createdBy: "user_id_here", // TODO: Get from auth context
      };

      if (editingDeal) {
        await dealApi.updateDeal(editingDeal._id, dealData);
        console.log("Deal updated successfully:", dealData);
      } else {
        await dealApi.createDeal(dealData);
        console.log("Deal created successfully:", dealData);
      }

      closeDialog();
      onDealSaved?.(); // Refresh the deals list
    } catch (error) {
      console.error('Error saving deal:', error);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await imageApi.uploadImage(formData);
      return response.data.url; // Assuming the API returns { url: "..." }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingDeal ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {optionsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {optionsError}
            </div>
          )}

          {/* Input Fields */}
          {inputFields.map((item) => (
            <div key={item.id}>
              <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                {item.title}
              </Label>
              {item.type === 'file' ? (
                <div className="mt-1">
                  {editingDeal && formData.image && (
                    <div className="mb-3">
                      <Label className="text-sm text-gray-600 mb-2 block">Current Image:</Label>
                      <div className="relative inline-block">
                        <img
                          src={import.meta.env.VITE_BACKEND_URL + formData.image}
                          alt="Current deal image"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                  <Input
                    id={item.id}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-2"
                  />
                  {imageFile && (
                    <div className="mt-2">
                      <Label className="text-sm text-gray-600 mb-2 block">New Image Preview:</Label>
                      <div className="relative inline-block">
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="New image preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  id={item.id}
                  placeholder={item.placeholder}
                  value={formData[item.id as keyof typeof formData] as string}
                  onChange={(e) => handleInputChange(item.id, e.target.value)}
                  className="mt-1"
                  required
                  type="text"
                />
              )}
            </div>
          ))}

          {/* Multi-Select Fields */}
          {multiSelectFields.map((item) => {
            // Map field IDs to options keys
            const optionsKey = item.id === 'subCategories' ? 'subCategories' : item.id;
            return (
              <div key={item.id}>
                <Label className="text-royal-dark-gray font-medium">
                  {item.title}
                </Label>
                <MultiSelect
                  options={options[optionsKey as keyof typeof options] as MultiSelectOption[] || []}
                  selected={formData[item.id as keyof typeof formData] as string[]}
                  onChange={(selected) => handleMultiSelectChange(item.id, selected)}
                  placeholder={item.placeholder}
                  className="mt-1"
                  disabled={loading}
                />
              </div>
            );
          })}

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
                <SelectContent className="max-h-[300px]">
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
            {loading ? (editingDeal ? "Updating..." : "Creating...") : (editingDeal ? "Update" : "Create")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}