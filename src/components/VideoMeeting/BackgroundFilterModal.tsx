import React from 'react';
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useDailyMeeting } from "../../context/DailyMeetingContext";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";

interface BackgroundFilterModalProps {
  children: React.ReactNode;
}

export const BackgroundFilterModal: React.FC<BackgroundFilterModalProps> = ({ children }) => {
  const {
    backgroundFilterType,
    setBackgroundFilter,
    backgroundImages,
    selectedBackgroundImage,
  } = useDailyMeeting();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Background Filters</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          <Button
            onClick={() => setBackgroundFilter('none')}
            className={cn("w-full h-24 flex flex-col items-center justify-center", backgroundFilterType === 'none' && "bg-blue-600 border-2 border-blue-400")}
          >
            None
          </Button>
          <Button
            onClick={() => setBackgroundFilter('blur')}
            className={cn("w-full h-24 flex flex-col items-center justify-center", backgroundFilterType === 'blur' && "bg-blue-600 border-2 border-blue-400")}
          >
            Blur
          </Button>
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={cn("relative w-full h-24 cursor-pointer rounded-md border-2", selectedBackgroundImage === image ? "border-blue-500" : "border-gray-700", "overflow-hidden")}
              onClick={() => setBackgroundFilter('image', image)}
            >
              <img
                src={image}
                alt={`Background ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedBackgroundImage === image && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-50 text-white font-bold">
                  Selected
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

