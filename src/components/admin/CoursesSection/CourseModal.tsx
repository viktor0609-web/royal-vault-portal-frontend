import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const formField = [
  { title: 'Name', id: 'name', placeholder: '', type: 'input' },
  { title: 'Description', id: 'description', placeholder: '', type: 'input' },
  { title: 'Iconify', id: 'iconify', placeholder: '', type: 'input' },
]

export function CourseModal({ isOpen, closeDialog }) {

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    iconify: ""
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
            return (
              <div key={`div${index}`}>
                <Label htmlFor="email" className="text-royal-dark-gray font-medium">
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