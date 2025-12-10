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
import { ProgressBar } from "@/components/ui/progress-bar";
import { Checkbox } from "@/components/ui/checkbox";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useImageUpload } from "@/hooks/useImageUpload";
import { dealApi, optionsApi } from "@/lib/api";
import type { Deal } from "@/types";


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
    displayOnPublicPage: false,
    isRoyalVetted: false,
    currentOffering: "",
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Image upload hook for signed URL uploads
  const { uploadImage: uploadImageToSupabase, isUploading: isImageUploading } = useImageUpload();

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
      const isRoyalVetted = (editingDeal as any).isRoyalVetted || false;
      const initialData = {
        name: editingDeal.name || "",
        url: editingDeal.url || "",
        categories: editingDeal.category?.map((cat: any) => cat._id) || [],
        subCategories: editingDeal.subCategory?.map((sub: any) => sub._id) || [],
        types: editingDeal.type?.map((type: any) => type._id) || [],
        strategies: editingDeal.strategy?.map((strategy: any) => strategy._id) || [],
        requirements: editingDeal.requirement?.map((req: any) => req._id) || [],
        image: editingDeal.image || "",
        // If Royal Vetted, set source to "royal_vetted_special", otherwise use actual source
        source: isRoyalVetted ? "royal_vetted_special" : (editingDeal.source?._id || ""),
        displayOnPublicPage: (editingDeal as any).displayOnPublicPage || false,
        isRoyalVetted: isRoyalVetted,
        currentOffering: (editingDeal as any).currentOffering || "",
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
        displayOnPublicPage: false,
        isRoyalVetted: false,
        currentOffering: "",
      };
      setFormData(emptyData);
      setInitialFormData(emptyData);
      // Reset image file (blob URL cleanup happens automatically via useEffect)
      setImageFile(null);
      setImageUrl("");
      setImageInputType("file");
    }
  }, [editingDeal, isOpen]);

  // Ensure source value is set after options are loaded when editing
  useEffect(() => {
    if (editingDeal && options.sources.length > 0) {
      const isRoyalVetted = (editingDeal as any).isRoyalVetted || false;
      setFormData(prev => {
        // If Royal Vetted, ensure source is set to "royal_vetted_special"
        // Otherwise, set to actual source ID if it exists
        const expectedSource = isRoyalVetted ? "royal_vetted_special" : (editingDeal.source?._id || "");
        if (prev.source !== expectedSource) {
          return {
            ...prev,
            source: expectedSource
          };
        }
        return prev;
      });
    }
  }, [options.sources, editingDeal]);

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

      // Add "Royal Vetted" as a special source option
      const sourcesList = sourcesRes.data.sources.map((item: any) => ({ label: item.name, value: item._id }));
      // Check if "Royal Vetted" already exists, if not add it as a special option
      const hasRoyalVetted = sourcesList.some((s: any) => s.label === "Royal Vetted");
      if (!hasRoyalVetted) {
        sourcesList.unshift({ label: "Royal Vetted", value: "royal_vetted_special" });
      }

      const optionsData = {
        categories: categoriesRes.data.categories.map((item: any) => ({ label: item.name, value: item._id })),
        subCategories: subCategoriesRes.data.subCategories.map((item: any) => ({ label: item.name, value: item._id })),
        types: typesRes.data.types.map((item: any) => ({ label: item.name, value: item._id })),
        strategies: strategiesRes.data.strategies.map((item: any) => ({ label: item.name, value: item._id })),
        requirements: requirementsRes.data.requirements.map((item: any) => ({ label: item.name, value: item._id })),
        sources: sourcesList,
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
        // Determine if Royal Vetted based on source selection
        isRoyalVetted: formData.source === "royal_vetted_special" || formData.isRoyalVetted,
        // Only send sourceId if not Royal Vetted (royal_vetted_special is not a real source ID)
        sourceId: (formData.source === "royal_vetted_special" || formData.isRoyalVetted) ? null : (formData.source || null),
        displayOnPublicPage: formData.displayOnPublicPage,
        // Only send currentOffering if Royal Vetted
        currentOffering: (formData.source === "royal_vetted_special" || formData.isRoyalVetted) ? (formData.currentOffering || null) : null,
        createdBy: "user_id_here", // TODO: Get from auth context
      };

      if (editingDeal) {
        await dealApi.updateDeal(editingDeal._id, dealData as unknown as Partial<Deal>);
        console.log("Deal updated successfully:", dealData);
      } else {
        await dealApi.createDeal(dealData as unknown as Partial<Deal>);
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
    if (field === "source") {
      // Check if "Royal Vetted" is selected
      const selectedSource = options.sources.find((s: any) => s.value === value);
      const isRoyalVettedSource = value === "royal_vetted_special" ||
        (selectedSource && selectedSource.label === "Royal Vetted");

      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        if (isRoyalVettedSource) {
          newData.isRoyalVetted = true;
          // Keep existing offering if any, or leave empty
          newData.currentOffering = newData.currentOffering || "";
        } else {
          newData.isRoyalVetted = false;
          newData.currentOffering = ""; // Clear offering when not Royal Vetted
        }
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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
    setIsUploadingImage(true);
    setUploadProgress(0);
    try {
      const response = await uploadImageToSupabase(file, (progress) => {
        setUploadProgress(progress.percentage);
      });
      return response.url; // Returns { url: "...", filename: "...", ... }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
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
                  {isUploadingImage && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 block">Uploading image...</Label>
                      <ProgressBar progress={uploadProgress} size="md" />
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

            {/* Single Select Fields - Source is always visible, includes Royal Vetted option */}
            <div className="space-y-4">
              {singleSelectFields.map((item) => (
                <div key={item.id} className="space-y-2">
                  <Label className="text-sm font-semibold text-royal-dark-gray">
                    {item.title}
                  </Label>
                  <Select
                    key={`${item.id}-${options.sources.length > 0 ? 'loaded' : 'loading'}`}
                    value={formData[item.id as keyof typeof formData] as string || undefined}
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

            {/* Deal Status Options */}
            <div className="space-y-4 pt-4 border-t-2 border-gray-300">
              {/* Current Offering - Only shown when Royal Vetted source is selected */}
              {formData.isRoyalVetted && (
                <div className="space-y-2 py-2 bg-blue-50/50 p-4 rounded-lg border border-blue-200">
                  <Label className="text-sm font-semibold text-royal-dark-gray">
                    Current Offering
                  </Label>
                  <Select
                    value={formData.currentOffering || "none"}
                    onValueChange={(value) => handleInputChange("currentOffering", value === "none" ? "" : value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select offering status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Display on Public Pages - Last item */}
              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="displayOnPublicPage"
                  checked={formData.displayOnPublicPage}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ ...prev, displayOnPublicPage: checked === true }));
                  }}
                />
                <Label
                  htmlFor="displayOnPublicPage"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Display on public pages
                </Label>
              </div>
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