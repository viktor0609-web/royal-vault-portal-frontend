import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { UnsavedChangesDialog } from "@/components/ui/unsaved-changes-dialog";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { webinarApi, api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, X, Plus, Trash2 } from "lucide-react";
import { formatDateForInput, convertLocalToUTC } from "@/utils/dateUtils";
import type { Webinar } from "@/types";

// Form field configuration with required/optional indicators
const formFields = [
  { title: 'Stream Type', id: 'streamType', placeholder: 'Choose an option...', type: 'select', required: true, options: ['Live Call', 'Webinar'] },
  { title: 'Date', id: 'date', desc: 'Your Timezone', placeholder: 'Air Date/Time Picker', type: 'datetime', required: true },
  { title: 'Name', id: 'name', placeholder: 'The "New-Rich" Loophie To Pay 0-10% In Tax(Legally)', type: 'input', required: true },
  { title: 'Slug', id: 'slug', placeholder: 'free-webinar-learn-tax-investing-legal-strategies', type: 'input', required: true },
  { title: 'Line1', id: 'line1', desc: 'Important! This is what users see.', placeholder: '', type: 'input', required: true },
  { title: 'Line2', id: 'line2', placeholder: '', type: 'input', required: false },
  { title: 'Line3', id: 'line3', placeholder: '', type: 'input', required: false },
  { title: 'Status', id: 'status', placeholder: 'Choose an option...', type: 'select', required: true, options: ['Scheduled', 'Waiting', 'In Progress', 'Ended'] },
  { title: 'Display Comments', id: 'displayComments', placeholder: 'Choose an option...', type: 'select', required: true, options: ['Yes', 'No'] },
  { title: 'Portal Display', id: 'portalDisplay', placeholder: 'Choose an option...', type: 'select', required: true, options: ['Yes', 'No'] },
  { title: 'Calendar Invite Description', id: 'calInvDesc', placeholder: 'Type here...', type: 'textarea', required: false },
  { title: 'Promotional Workflow ID', id: 'proWorkId', desc: 'To unenroll', placeholder: '1234', type: 'input', required: false },
  { title: 'Reminder SMS', id: 'reminderSms', desc: 'Sent 10 Minutes In Advance', placeholder: 'Type here...', type: 'textarea', required: false },
  { title: 'Promotional SMS List', id: 'proSmsList', placeholder: 'Choose an option...', type: 'select', required: false, options: [] }, // Will be populated from API
  { title: 'Promotional SMS', id: 'proSms', desc: 'Sent 24 Hours In Advance', placeholder: 'Type here...', type: 'textarea', required: false },
  { title: 'Promotional SMS Time Advance', id: 'proSmsTime', desc: 'In Minutes', placeholder: '60', type: 'input', required: false },
  { title: 'Attend Overwrite', id: 'attendOverwrite', placeholder: '100', type: 'input', required: false },
  { title: 'Recording', id: 'recording', desc: 'For Replay', placeholder: 'recordingName.mp4', type: 'file', required: false },
]

interface WebinarModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  editingWebinar?: any;
  onWebinarSaved?: (webinarData?: any, isUpdate?: boolean) => void;
}

export function WebinarModal({ isOpen, closeDialog, editingWebinar, onWebinarSaved }: WebinarModalProps) {
  const [formData, setFormData] = useState({
    streamType: "",
    date: "",
    name: "",
    slug: "",
    line1: "",
    line2: "",
    line3: "",
    status: "",
    displayComments: "",
    portalDisplay: "",
    calInvDesc: "",
    proWorkId: "",
    reminderSms: "",
    proSmsList: "",
    proSms: "",
    proSmsTime: "",
    attendOverwrite: "",
    recording: "",
  });

  const [promotionalSmsLists, setPromotionalSmsLists] = useState([]);
  const [filteredPromotionalSmsLists, setFilteredPromotionalSmsLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ctas, setCtas] = useState<Array<{ label: string; link: string }>>([]);
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  const [initialCtas, setInitialCtas] = useState<Array<{ label: string; link: string }>>([]);
  const { toast } = useToast();
  const searchRef = useRef<HTMLDivElement>(null);

  // Track unsaved changes with custom hook
  const ctasChanged = JSON.stringify(ctas) !== JSON.stringify(initialCtas);
  const { hasUnsavedChanges, resetChanges } = useUnsavedChanges(initialFormData, formData, ctasChanged);

  // Fetch promotional SMS lists when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPromotionalSmsLists();
    }
  }, [isOpen]);

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editingWebinar) {
      const initialData = {
        streamType: editingWebinar.streamType || "",
        date: formatDateForInput(editingWebinar.date),
        name: editingWebinar.name || "",
        slug: editingWebinar.slug || "",
        line1: editingWebinar.line1 || "",
        line2: editingWebinar.line2 || "",
        line3: editingWebinar.line3 || "",
        status: editingWebinar.status || "",
        displayComments: editingWebinar.displayComments || "",
        portalDisplay: editingWebinar.portalDisplay || "",
        calInvDesc: editingWebinar.calInvDesc || "",
        proWorkId: editingWebinar.proWorkId || "",
        reminderSms: editingWebinar.reminderSms || "",
        proSmsList: editingWebinar.proSmsList?._id || editingWebinar.proSmsList || "",
        proSms: editingWebinar.proSms || "",
        proSmsTime: editingWebinar.proSmsTime || "",
        attendOverwrite: editingWebinar.attendOverwrite || "",
        recording: editingWebinar.recording || "",
      };
      const initialCtasData = editingWebinar.ctas || [];
      setFormData(initialData);
      setInitialFormData(initialData);
      setCtas(initialCtasData);
      setInitialCtas(initialCtasData);
    } else {
      // Reset form for new webinar
      const emptyData = {
        streamType: "",
        date: "",
        name: "",
        slug: "",
        line1: "",
        line2: "",
        line3: "",
        status: "",
        displayComments: "",
        portalDisplay: "",
        calInvDesc: "",
        proWorkId: "",
        reminderSms: "",
        proSmsList: "",
        proSms: "",
        proSmsTime: "",
        attendOverwrite: "",
        recording: "",
      };
      setFormData(emptyData);
      setInitialFormData(emptyData);
      setCtas([]);
      setInitialCtas([]);
    }
  }, [editingWebinar, isOpen]);

  const fetchPromotionalSmsLists = async () => {
    try {
      const { data } = await api.get('/api/promotional-sms-lists');
      const lists = data.lists || [];
      setPromotionalSmsLists(lists);
      setFilteredPromotionalSmsLists(lists);
    } catch (error) {
      console.error('Error fetching promotional SMS lists:', error);
      // Fallback to mock data if API fails
      const mockData = [
        { listId: '1', name: 'General List' },
        { listId: '2', name: 'VIP List' },
        { listId: '3', name: 'Premium List' }
      ];
      setPromotionalSmsLists(mockData);
      setFilteredPromotionalSmsLists(mockData);
    }
  };

  // Filter promotional SMS lists based on search query
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPromotionalSmsLists(promotionalSmsLists);
    } else {
      const filtered = promotionalSmsLists.filter((list: any) =>
        list.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPromotionalSmsLists(filtered);
    }
  };

  // Clear search and reset to all lists
  const clearSearch = () => {
    setSearchQuery('');
    setFilteredPromotionalSmsLists(promotionalSmsLists);
    setIsSearchOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data for submission - convert local datetime to UTC for MongoDB
      const submitData = {
        ...formData,
        date: convertLocalToUTC(formData.date),
        ctas: ctas.filter(cta => cta.label.trim() !== '' && cta.link.trim() !== '')
      };

      let response;
      if (editingWebinar) {
        response = await webinarApi.updateWebinar(editingWebinar._id, submitData as Partial<Webinar>);
        toast({
          title: "Success",
          description: "Webinar updated successfully",
        });
      } else {
        response = await webinarApi.createWebinar(submitData as Partial<Webinar>);
        toast({
          title: "Success",
          description: "Webinar created successfully",
        });
      }
      resetChanges(); // Reset unsaved changes flag after successful save
      onWebinarSaved?.(response.data.webinar, !!editingWebinar);
      closeDialog();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to save webinar";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCta = () => {
    if (ctaLabel.trim() === '' || ctaLink.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Both label and link are required for CTA",
        variant: "destructive",
      });
      return;
    }

    setCtas([...ctas, { label: ctaLabel.trim(), link: ctaLink.trim() }]);
    setCtaLabel('');
    setCtaLink('');
  };

  const removeCta = (index: number) => {
    setCtas(ctas.filter((_, i) => i !== index));
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
        <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mb-4">
              {editingWebinar ? "Edit Webinar" : "Create Webinar"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formFields.map((item, index) => {
              const isRequired = item.required;
              const fieldOptions = item.id === 'proSmsList' ? filteredPromotionalSmsLists : item.options;

              // Special case for Promotional SMS List with search functionality
              if (item.id === 'proSmsList') {
                return (
                  <div key={`div${index}`}>
                    <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                      {item.title}
                      {isRequired && <span className="text-red-500 ml-1">*</span>}
                      {item.desc && <span className="text-gray-500 ml-2">{item.desc}</span>}
                    </Label>
                    <div className="relative mt-1" ref={searchRef}>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Search promotional SMS lists..."
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          onFocus={() => setIsSearchOpen(true)}
                          className="pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>

                      {isSearchOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredPromotionalSmsLists.length > 0 ? (
                            filteredPromotionalSmsLists.map((list: any) => (
                              <div
                                key={list.listId || list._id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                  handleInputChange(item.id, list.listId || list._id);
                                  setIsSearchOpen(false);
                                  setSearchQuery(list.name);
                                }}
                              >
                                <div className="font-medium text-gray-900">{list.name}</div>
                                {list.description && (
                                  <div className="text-sm text-gray-500">{list.description}</div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500 text-center">
                              No promotional SMS lists found
                            </div>
                          )}

                          {searchQuery && (
                            <div className="px-3 py-2 border-t border-gray-200">
                              <button
                                type="button"
                                onClick={clearSearch}
                                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Clear search
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {formData[item.id] && (
                        <div className="mt-2 flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                          <span className="text-sm text-gray-700">
                            Selected: {promotionalSmsLists.find((list: any) =>
                              (list.listId || list._id) === formData[item.id]
                            )?.name || 'Unknown'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange(item.id, '');
                              setSearchQuery('');
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              switch (item.type) {
                case 'input':
                  return (
                    <div key={`div${index}`}>
                      <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                        {item.title}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                        {item.desc && <span className="text-gray-500 ml-2">{item.desc}</span>}
                      </Label>
                      <Input
                        id={item.id}
                        placeholder={item.placeholder}
                        value={formData[item.id]}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        className="mt-1"
                        required={isRequired}
                      />
                    </div>
                  )
                case 'select':
                  return (
                    <div key={`div${index}`}>
                      <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                        {item.title}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                        {item.desc && <span className="text-gray-500 ml-2">{item.desc}</span>}
                      </Label>
                      <Select
                        value={formData[item.id]}
                        onValueChange={(value) => handleInputChange(item.id, value)}
                      >
                        <SelectTrigger className="border-royal-light-gray">
                          <SelectValue placeholder={item.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions && fieldOptions.length > 0 ? (
                            fieldOptions.map((option, optionIndex) => {
                              // Handle both string options and object options
                              const optionValue = typeof option === 'string' ? option : (option.listId || option._id || option);
                              const optionLabel = typeof option === 'string' ? option : (option.name || option);
                              const optionKey = typeof option === 'string' ? option : (option.listId || option._id || optionIndex);

                              return (
                                <SelectItem key={optionKey} value={optionValue}>
                                  {optionLabel}
                                </SelectItem>
                              );
                            })
                          ) : (
                            <SelectItem value="placeholder">No options available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                case 'textarea':
                  return (
                    <div key={`div${index}`}>
                      <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                        {item.title}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                        {item.desc && <span className="text-gray-500 ml-2">{item.desc}</span>}
                      </Label>
                      <Textarea
                        id={item.id}
                        placeholder={item.placeholder}
                        value={formData[item.id]}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        className="mt-1"
                        required={isRequired}
                        rows={3}
                      />
                    </div>
                  )
                case 'datetime':
                  return (
                    <div key={`div${index}`}>
                      <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                        {item.title}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                        {item.desc && <span className="text-gray-500 ml-2">{item.desc}</span>}
                      </Label>
                      <input
                        type="datetime-local"
                        id={item.id}
                        value={formData[item.id] || ''}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={isRequired}
                      />
                    </div>
                  )
                case 'file':
                  return (
                    <div key={`div${index}`}>
                      <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                        {item.title}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                        {item.desc && <span className="text-gray-500 ml-2">{item.desc}</span>}
                      </Label>
                      <Input
                        id={item.id}
                        placeholder={item.placeholder}
                        type='file'
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleInputChange(item.id, file?.name || '');
                        }}
                        className="mt-1"
                        required={isRequired}
                      />
                    </div>
                  )
              }
            })}

            {/* Call to Action Section */}
            <div className="border-t pt-4">
              <Label className="text-royal-dark-gray font-medium text-base mb-3 block">
                Call to Action Buttons
              </Label>

              {/* Input fields for new CTA */}
              <div className="space-y-3 mb-4 p-3 border rounded-md bg-gray-50">
                <div>
                  <Label htmlFor="new-cta-label" className="text-sm text-gray-600">
                    Button Label
                  </Label>
                  <Input
                    id="new-cta-label"
                    placeholder="e.g., Register Now, Learn More"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-cta-link" className="text-sm text-gray-600">
                    Link URL
                  </Label>
                  <Input
                    id="new-cta-link"
                    placeholder="https://example.com"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addCta}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add CTA
                </Button>
              </div>

              {/* List of added CTAs */}
              {ctas.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4 border border-dashed rounded-md">
                  No CTAs added yet. Fill in the label and link above, then click "Add CTA".
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Added CTAs:</Label>
                  {ctas.map((cta, index) => (
                    <div key={index} className="flex items-start justify-between border rounded-md p-3 bg-white">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{cta.label}</div>
                        <div className="text-sm text-gray-500 break-all">{cta.link}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCta(index)}
                        className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
              disabled={loading}
            >
              {loading ? (editingWebinar ? "Updating..." : "Creating...") : (editingWebinar ? "Update Webinar" : "Create Webinar")}
            </Button>
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