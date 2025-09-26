
import { useState } from "react";
import { BoxSelectIcon, UserIcon } from "lucide-react";
import { AdminMeeting } from "./AdminMeeting";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../ui/select";

export const VideoMeeting = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <div className="flex justify-between bg-white p-6 rounded-lg border border-royal-light-gray mb-3 flex-shrink-0">
        <div className="flex gap-4 items-center">
          <BoxSelectIcon className="h-10 w-10 text-royal-gray" />
          <h1 className="text-2xl font-bold text-royal-dark-gray mb-2 uppercase">Elite Coaching 09-30-25</h1>
        </div>
        <div className="flex items-center gap-2">
          <p className="mr-5">0&nbsp;Viewers&nbsp;Attended</p>
          <UserIcon className="w-10" />
          <Select>
            <SelectTrigger className="border-royal-light-gray">
              <SelectValue placeholder={'Choose an Option...'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder">Coming Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Video / Room Area */}
        <div className="flex-1 p-4 flex flex-col min-h-0">
          <AdminMeeting />
        </div>
      </div>
    </div>
  );
}