import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export function RecsModal({ isOpen, closeDialog }) {

    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Creating account:");
        closeDialog();
    };

    const handleInputChange = (value: string) => {
        setName(value);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <Label htmlFor="name" className="text-royal-dark-gray font-medium">
                            Local Recording
                        </Label>
                        <Input
                            id={name}
                            value={name}
                            type="file"
                            onChange={(e) => handleInputChange(e.target.value)}
                            className="mt-1"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-royal-blue-dark text-white py-3 text-lg font-medium"
                    >
                        Upload
                    </Button>

                </form>
            </DialogContent>
        </Dialog>
    );
}