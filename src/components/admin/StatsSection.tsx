import { useState } from "react";

import { useLocation, useParams } from "react-router-dom";
import { BoxSelectIcon } from "lucide-react";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";


const stages = [
    { label: "Views", value: 4, percent: "100%" },
    { label: "Registrations", value: 2, percent: "50%" },
    { label: "Attendees", value: 0, percent: "0%" },
    { label: "Offer Clicks", value: 0, percent: "0%" },
    { label: "Sales", value: 0, percent: "0%" },
];

export function StatsSection() {
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const title = queryParams.get("title");

    return (
        <div className="flex-1 p-4 flex flex-col">
            <div className="flex gap-4 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
                <BoxSelectIcon className="h-10 w-10 text-royal-gray" />
                <h1 className="text-2xl font-bold text-royal-dark-gray mb-2 uppercase">{title}</h1>
            </div>
            <div className="flex gap-3 w-full h-full">
                <div className="bg-white rounded-xl shadow p-4 h-full w-full">
                    <div className="flex">
                        {stages.map((stage, idx) => (
                            <div key={idx} className="flex-1 text-center relative">
                                <div className="mb-1 text-xl font-bold">{stage.value}</div>
                                <div className="text-sm font-medium">{stage.label}</div>
                                <div className="text-xs text-gray-500">{stage.percent}</div>

                                {/* connector gradient */}
                                {idx < stages.length - 1 && (
                                    <div className="absolute top-32 left-1/2 w-full h-24 -translate-x-1/2 overflow-hidden">
                                        <div
                                            className="h-full w-full"
                                            style={{
                                                background:
                                                    idx === 0
                                                        ? "linear-gradient(to right, #f97316, #ef4444, transparent)"
                                                        : "linear-gradient(to right, #ef4444, transparent)",
                                                clipPath:
                                                    "path('M0,0 Q50,30 100,0 L100,100 Q50,70 0,100 Z')",
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow px-8 py-4 h-28 w-96">
                    <Label htmlFor='source' className="text-royal-dark-gray font-medium">
                        Source
                    </Label>
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
        </div>
    );
}