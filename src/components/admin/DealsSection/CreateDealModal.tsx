import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const formField = [
  { title: 'Name', id:'name', placeholder: 'The "New-Rich" Loophole To Pay 0-10% In Tax(Legally|)', type: 'input' },
  { title: 'URL', id:'url', placeholder: 'www.dealwebsite.com', type: 'input' },
  { title: 'Categories', id:'categories', placeholder: 'Choose some options', type: 'select' },
  { title: 'Sub-Categories', id:'subCategories', placeholder: 'Choose some options', type: 'select' },
  { title: 'Types', id:'types', placeholder: 'Choose some options', type: 'select' },
  { title: 'Strategies', id:'strategies', placeholder: 'Choose some options', type: 'select' },
  { title: 'Requirements', id:'requirements', placeholder: 'Choose some options', type: 'select' },
  { title: 'Image', id:'image', placeholder: 'Image', type: 'file' },
  { title: 'Source', id:'source', placeholder: 'Choose some options', type: 'select' },

]

export function CreateDealModal({ isOpen, closeDialog }) {

  const [formData, setFormData] = useState({
    email: "",
    url: "",
    categories: "",
    subCategories: "",
    types: "",
    strategies: "",
    requirements: "",
    image: "",
    source: "",
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
                <Label htmlFor="email"  className="text-royal-dark-gray font-medium">
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