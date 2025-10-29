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
import { UnsavedChangesDialog } from "@/components/ui/unsaved-changes-dialog";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
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
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any>(null);

  // Track unsaved changes with custom hook
  const additionalChanges = imageFile !== null || (imageInputType === "url" && imageUrl !== (initialFormData?.image || ''));
  const { hasUnsavedChanges, resetChanges } = useUnsavedChanges(initialFormData, formData, additionalChanges);

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
      const initialData = {
        name: editingDeal.name || "",
        url: editingDeal.url || "",
        categories: editingDeal.category?.map((cat: any) => cat._id) || [],
        subCategories: editingDeal.subCategory?.map((sub: any) => sub._id) || [],
        types: editingDeal.type?.map((type: any) => type._id) || [],
        strategies: editingDeal.strategy?.map((strategy: any) => strategy._id) || [],
        requirements: editingDeal.requirement?.map((req: any) => req._id) || [],
        image: editingDeal.image || "",
        source: editingDeal.source?._id || "",
      };
      setFormData(initialData);
      setInitialFormData(initialData);
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
      const emptyData = {
        name: "",
        url: "",
        categories: [],
        subCategories: [],
        types: [],
        strategies: [],
        requirements: [],
        image: "",
        source: "",
      };
      setFormData(emptyData);
      setInitialFormData(emptyData);
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

      resetChanges(); // Reset flag after successful save
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

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // User is trying to close the dialog
      if (hasUnsavedChanges) {
        // Show confirmation dialog
        setShowCloseConfirmation(true);
      } else {
        // No changes, close directly
        closeDialog();
      }
    }
  };

  const confirmClose = () => {
    setShowCloseConfirmation(false);
    closeDialog();
  };

  const cancelClose = () => {
    setShowCloseConfirmation(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-royal-dark-gray">
              {editingDeal ? 'Edit Deal' : 'Create New Deal'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 space-y-5">
            {optionsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-medium">{optionsError}</p>
              </div>
            )}

            {/* Input Fields */}
            <div className="space-y-4">
              {inputFields.map((item) => (
                <div key={item.id} className="space-y-2">
                  <Label htmlFor={item.id} className="text-sm font-semibold text-royal-dark-gray">
                    {item.title}
                  </Label>
                  <Input
                    id={item.id}
                    placeholder={item.placeholder}
                    value={formData[item.id as keyof typeof formData] as string}
                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                    className="h-11 text-base"
                    type="text"
                  />
                </div>
              ))}
            </div>

            {/* Image Field with Tabs */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-royal-dark-gray">Image</Label>
              <Tabs
                value={imageInputType}
                onValueChange={(value) => setImageInputType(value as "file" | "url")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-11">
                  <TabsTrigger value="file" className="text-sm">Upload File</TabsTrigger>
                  <TabsTrigger value="url" className="text-sm">Use URL</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-3 mt-3">
                  {editingDeal && formData.image && !formData.image.startsWith('http') && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-2 block">Current Image</Label>
                      <div className="relative inline-block">
                        <img
                          src={import.meta.env.VITE_BACKEND_URL + formData.image}
                          alt="Current deal image"
                          className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="h-11 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                  {imagePreviewUrl && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-2 block">New Image Preview</Label>
                      <div className="relative inline-block">
                        <img
                          src={imagePreviewUrl}
                          alt="New image preview"
                          className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-primary shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="url" className="space-y-3 mt-3">
                  {editingDeal && formData.image && formData.image.startsWith('http') && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-2 block">Current Image</Label>
                      <div className="relative inline-block">
                        <img
                          src={formData.image}
                          alt="Current deal image"
                          className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    type="url"
                    className="h-11 text-base"
                  />
                  {imageUrl && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-2 block">Image Preview</Label>
                      <div className="relative inline-block">
                        <img
                          src={imageUrl}
                          alt="Image preview"
                          className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-primary shadow-sm"
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
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-royal-dark-gray mb-4 uppercase tracking-wide">Deal Classification</h3>
                <div className="space-y-4">
                  {multiSelectFields.map((item) => {
                    // Map field IDs to options keys
                    const optionsKey = item.id === 'subCategories' ? 'subCategories' : item.id;
                    return (
                      <div key={item.id} className="space-y-2">
                        <Label className="text-sm font-semibold text-royal-dark-gray">
                          {item.title}
                        </Label>
                        <MultiSelect
                          options={options[optionsKey as keyof typeof options] as MultiSelectOption[] || []}
                          selected={formData[item.id as keyof typeof formData] as string[]}
                          onChange={(selected) => handleMultiSelectChange(item.id, selected)}
                          placeholder={item.placeholder}
                          disabled={loading}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Single Select Fields */}
            <div className="space-y-4">
              {singleSelectFields.map((item) => (
                <div key={item.id} className="space-y-2">
                  <Label className="text-sm font-semibold text-royal-dark-gray">
                    {item.title}
                  </Label>
                  <Select
                    value={formData[item.id as keyof typeof formData] as string}
                    onValueChange={(value) => handleInputChange(item.id, value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-11 text-base">
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
            </div>

            {/* Submit Button */}
            <div className="pt-4 pb-2 border-t border-gray-200">
              <Button
                type="submit"
                className="w-full h-12 text-base sm:text-lg font-semibold shadow-md hover:shadow-lg transition-shadow"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{editingDeal ? "Updating..." : "Creating..."}</span>
                  </div>
                ) : (
                  editingDeal ? "Update Deal" : "Create Deal"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={showCloseConfirmation}
        onOpenChange={setShowCloseConfirmation}
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
    </>
  );
}