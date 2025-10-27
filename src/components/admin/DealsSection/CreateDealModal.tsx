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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [imageUrl, setImageUrl] = useState("");
  const [imageInputType, setImageInputType] = useState<"file" | "url">("file");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

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

  // Handle image file preview URL lifecycle
  useEffect(() => {
    // Create new preview URL if there's a file
    if (imageFile) {
      const previewUrl = URL.createObjectURL(imageFile);
      setImagePreviewUrl(previewUrl);

      // Cleanup function to revoke the URL when the effect runs again or component unmounts
      return () => {
        URL.revokeObjectURL(previewUrl);
      };
    } else {
      setImagePreviewUrl(null);
    }
  }, [imageFile]);

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
      // Reset image file (blob URL cleanup happens automatically via useEffect)
      setImageFile(null);
      setImageUrl("");
      // Detect if existing image is a URL or file path
      if (editingDeal.image && (editingDeal.image.startsWith('http://') || editingDeal.image.startsWith('https://'))) {
        setImageInputType("url");
        setImageUrl(editingDeal.image);
      } else {
        setImageInputType("file");
      }
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
      // Reset image file (blob URL cleanup happens automatically via useEffect)
      setImageFile(null);
      setImageUrl("");
      setImageInputType("file");
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

      let finalImageUrl = formData.image;

      // Determine which image source to use
      if (imageInputType === "url" && imageUrl.trim()) {
        // Use the URL input
        finalImageUrl = imageUrl.trim();
      } else if (imageInputType === "file" && imageFile) {
        // Upload image file if a new file is selected
        finalImageUrl = await uploadImage(imageFile);
      }

      // Transform formData to match backend expectations
      // Note: No date fields here - createdAt/updatedAt are automatically handled by MongoDB in UTC
      // MongoDB's timestamps feature ensures all dates are stored in UTC
      // When editing, we don't send/receive date fields to avoid double-conversion
      const dealData = {
        name: formData.name,
        url: formData.url,
        image: finalImageUrl,
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
              <Input
                id={item.id}
                placeholder={item.placeholder}
                value={formData[item.id as keyof typeof formData] as string}
                onChange={(e) => handleInputChange(item.id, e.target.value)}
                className="mt-1"
                type="text"
              />
            </div>
          ))}

          {/* Image Field with Tabs */}
          <div>
            <Label className="text-royal-dark-gray font-medium">Image</Label>
            <Tabs
              value={imageInputType}
              onValueChange={(value) => setImageInputType(value as "file" | "url")}
              className="mt-1"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">Upload File</TabsTrigger>
                <TabsTrigger value="url">Use URL</TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-2">
                {editingDeal && formData.image && !formData.image.startsWith('http') && (
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
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2"
                />
                {imagePreviewUrl && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-600 mb-2 block">New Image Preview:</Label>
                    <div className="relative inline-block">
                      <img
                        src={imagePreviewUrl}
                        alt="New image preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="url" className="space-y-2">
                {editingDeal && formData.image && formData.image.startsWith('http') && (
                  <div className="mb-3">
                    <Label className="text-sm text-gray-600 mb-2 block">Current Image:</Label>
                    <div className="relative inline-block">
                      <img
                        src={formData.image}
                        alt="Current deal image"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>
                )}
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  type="url"
                />
                {imageUrl && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-600 mb-2 block">Image Preview:</Label>
                    <div className="relative inline-block">
                      <img
                        src={imageUrl}
                        alt="Image preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

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
                <SelectContent
                  className="max-h-[300px] overflow-y-auto"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d1d5db #f3f4f6',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
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