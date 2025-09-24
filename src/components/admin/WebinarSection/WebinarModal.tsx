import { useState, useEffect } from "react";
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
import { DatetimePicker } from "@/components/ui/datetimepicker";
import { webinarApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch promotional SMS lists when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPromotionalSmsLists();
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editingWebinar) {
      setFormData({
        streamType: editingWebinar.streamType || "",
        date: editingWebinar.date || "",
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
      const response = await fetch('/api/promotional-sms-lists');
      const data = await response.json();
      setPromotionalSmsLists(data.lists || []);
    } catch (error) {
      console.error('Error fetching promotional SMS lists:', error);
      // Fallback to mock data if API fails
      setPromotionalSmsLists([
        { _id: '1', name: 'General List' },
        { _id: '2', name: 'VIP List' },
        { _id: '3', name: 'Premium List' }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (editingWebinar) {
        response = await webinarApi.updateWebinar(editingWebinar._id, formData);
        toast({
          title: "Success",
          description: "Webinar updated successfully",
        });
      } else {
        response = await webinarApi.createWebinar(formData);
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
            const fieldOptions = item.id === 'proSmsList' ? promotionalSmsLists : item.options;

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
                    <Select onValueChange={(value) => handleInputChange(item.id, value)}>
                      <SelectTrigger className="border-royal-light-gray">
                        <SelectValue placeholder={item.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOptions && fieldOptions.length > 0 ? (
                          fieldOptions.map((option) => (
                            <SelectItem key={option._id || option.id || option} value={option._id || option.id || option}>
                              {option.name || option}
                            </SelectItem>
                          ))
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
                    <DatetimePicker
                      className="w-full"
                      value={formData[item.id]}
                      onChange={(value) => handleInputChange(item.id, value)}
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