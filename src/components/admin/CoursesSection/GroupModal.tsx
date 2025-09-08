import { useState } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export function GroupModal({ isOpen, closeDialog }) {

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
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <Label htmlFor="name" className="text-royal-dark-gray font-medium">
                            Name
                        </Label>
                        <Input
                            id={name}
                            value={name}
                            onChange={(e) => handleInputChange(e.target.value)}
                            className="mt-1"
                            required
                        />
                    </div>
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