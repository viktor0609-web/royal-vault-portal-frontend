import { useState } from "react";
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


const formField = [
  { title: 'StreamType', id: 'streamType', placeholder: 'Choose an option...', type: 'select' },
  { title: 'Date', id: 'date', desc: 'Your Timezone', placeholder: 'Air Date/Time Picker', type: 'datetime' },
  { title: 'Name', id: 'name', placeholder: 'The "New-Rich" Loophie To Pay 0-10% In Tax(Legally)', type: 'input' },
  { title: 'Slug', id: 'slug', placeholder: 'free-webinar-learn-tax-investing-legal-strategies', type: 'input' },
  { title: 'Calendar Invite Description', id: 'calInvDesc', placeholder: 'Type here...', type: 'textarea' },
  { title: 'Promotional Workflow ID', id: 'proWorkId', desc: 'To unenroll', placeholder: '1234', type: 'input' },
  { title: 'Split Test', id: 'splitTest', placeholder: 'Choose an option...', type: 'select' },
  { title: 'Line1', id: 'line1', desc: 'Important! This is waht users see.', placeholder: '', type: 'input' },
  { title: 'Line2', id: 'line2', placeholder: '', type: 'input' },
  { title: 'Line3', id: 'line3', placeholder: '', type: 'input' },
  { title: 'Reminder SMS', id: 'reminderSms', desc: 'Sent 10 Minutes In Advance', placeholder: 'Type here...', type: 'textarea' },
  { title: 'Promotional SMS List', id: 'proSmsList', placeholder: 'Choose an option...', type: 'select' },
  { title: 'Promotional SMS', id: 'proSms', desc: 'Sent 24 Hours In Advance', placeholder: 'Type here...', type: 'textarea' },
  { title: 'Promotional SMS Time Advance', id: 'proSmsTime', desc: 'In Minutes', placeholder: '60', type: 'input' },
  { title: 'Status', id: 'status', placeholder: 'Choose an option...', type: 'select' },
  { title: 'Attend Overwrite', id: 'attendOverwrite', placeholder: '100', type: 'input' },
  { title: 'Display Comments', id: 'displayComments', placeholder: 'Choose an option...', type: 'select' },
  { title: 'Portal Display', id: 'portalDisplay', placeholder: 'Choose an option...', type: 'select' },
  { title: 'Recording', id: 'recording', desc: 'For Replay', placeholder: 'recordingName.mp4', type: 'file' },
]

export function WebinarModal({ isOpen, closeDialog }) {

  const [formData, setFormData] = useState({
    streamType: "",
    date: "",
    name: "",
    slug: "",
    calInvDesc: "",
    proWorkId: "",
    splitTest: "",
    line1: "",
    line2: "",
    line3: "",
    reminderSms: "",
    proSmsList: "",
    proSms: "",
    proSmsTime: "",
    status: "",
    attendOverwrite: "",
    displayComments: "",
    recording: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating account:", formData);
    closeDialog();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-auto">
        <form onSubmit={handleSubmit} className="space-y-4">

          {formField.map((item, index) => {
            switch (item.type) {
              case 'input':
                return (
                  <div key={`div${index}`}>
                    <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                      {item.title}
                      <span className="text-gray-500">&nbsp;{item.desc}</span>
                    </Label>
                    <Input
                      id={item.id}
                      placeholder={item.placeholder}
                      value={formData[item.id]}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                )
              case 'select':
                return (
                  <div key={`div${index}`}>
                    <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                      {item.title}
                      <span className="text-gray-500">&nbsp;{item.desc}</span>
                    </Label>
                    <Select>
                      <SelectTrigger className="border-royal-light-gray">
                        <SelectValue placeholder={item.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )
              case 'textarea':
                return (
                  <div key={`div${index}`}>
                    <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                      {item.title}
                      <span className="text-gray-500">&nbsp;{item.desc}</span>
                    </Label>
                    <Textarea
                      id={item.id}
                      placeholder={item.placeholder}
                      value={formData[item.id]}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                )
              case 'datetime':
                return (
                  <div key={`div${index}`}>
                    <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                      {item.title}
                      <span className="text-gray-500">&nbsp;{item.desc}</span>
                    </Label>
                    <DatetimePicker className="w-full" />
                  </div>
                )
              case 'file':
                return (
                  <div key={`div${index}`}>
                    <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                      {item.title}
                      <span className="text-gray-500">&nbsp;{item.desc}</span>
                    </Label>
                    <Input
                      id={item.id}
                      placeholder={item.placeholder}
                      type='file'
                      value={formData[item.id]}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                )
            }
          }
          )}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
          >
            Create
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  );
}