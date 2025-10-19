import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { webinarApi, api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, X } from "lucide-react";

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
  const { toast } = useToast();
  const searchRef = useRef<HTMLDivElement>(null);

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
      // Format date for datetime-local input
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
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
      });
    } else {
      // Reset form for new webinar
      setFormData({
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
      // Prepare data for submission - convert date to proper format
      const submitData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : null
      };

      let response;
      if (editingWebinar) {
        response = await webinarApi.updateWebinar(editingWebinar._id, submitData);
        toast({
          title: "Success",
          description: "Webinar updated successfully",
        });
      } else {
        response = await webinarApi.createWebinar(submitData);
        toast({
          title: "Success",
          description: "Webinar created successfully",
        });
      }
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

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-auto">
        <DialogTitle className="text-xl font-semibold mb-4">
          {editingWebinar ? "Edit Webinar" : "Create Webinar"}
        </DialogTitle>
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
                      value={formData[item.id] ? new Date(formData[item.id]).toISOString().slice(0, 16) : ''}
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
  );
}