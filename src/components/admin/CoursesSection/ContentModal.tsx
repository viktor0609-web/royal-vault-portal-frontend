import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { DialogTitle } from "@radix-ui/react-dialog";

const formField = [
  { title: 'Name', id: 'name', placeholder: '', type: 'input' },
  { title: 'Content', id: 'content', placeholder: '', type: 'quill' },
  { title: 'URL', id: 'url', placeholder: '', type: 'input' },
  { title: 'Video File', id: 'videofile', placeholder: '', type: 'file' },
]

export function ContentModal({ isOpen, closeDialog }) {

  const [formData, setFormData] = useState({
    name: "",
    content: "",
    url: "",
    videofile: ""
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

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">

          {formField.map((item, index) => {
            if (item.type == "quill")
              return (
                <div key={`div${index}`}>
                  <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                    {item.title}
                  </Label>
                  <ReactQuill
                    theme="snow"
                    value={formData[item.id]}
                    onChange={(e) => handleInputChange(item.id, e)}
                    className="bg-white rounded-lg shadow-md"
                  />
                </div>
              )
            else
              return (
                <div key={`div${index}`}>
                  <Label htmlFor={item.id} className="text-royal-dark-gray font-medium">
                    {item.title}
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