import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

const inputVariants = cva(
  "border border-gray-300 rounded-lg p-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400",
  {
    variants: {
      variant: {
        default: "",
        rounded: "rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DatetimePickerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof inputVariants> {}

export const DatetimePicker = React.forwardRef<HTMLInputElement, DatetimePickerProps>(
  ({ className, variant, ...props }, ref) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = React.useState(new Date());
    const [inputValue, setInputValue] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [hour, setHour] = React.useState("12");
    const [minute, setMinute] = React.useState("00");

    const wrapperRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1);

    const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const handleConfirm = (day: number) => {
      let h = Math.min(Math.max(parseInt(hour || "0"), 0), 23);
      let m = Math.min(Math.max(parseInt(minute || "0"), 0), 59);

      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, h, m);
      setSelectedDate(newDate);
      setInputValue(
        newDate.toLocaleString("default", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setOpen(false);
    };

    return (
      <div ref={wrapperRef} className="relative w-full font-sans">
        {/* Input with icon */}
        <div className="relative w-full">
          <span className="absolute left-3 top-2.5 text-gray-400">
            <Calendar size={16} />
          </span>
          <input
            ref={ref}
            type="text"
            value={inputValue}
            readOnly
            placeholder="Select date & time"
            onClick={() => setOpen((o) => !o)}
            className={cn(inputVariants({ variant }), className)}
            {...props}
          />
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 mt-2 w-full z-50 bg-white border border-gray-200 rounded-lg shadow-lg animate-fade-in p-4">
            {/* Month navigation */}
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={handlePrevMonth}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                &lt;
              </button>
              <span className="font-semibold text-gray-700">
                {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
              </span>
              <button
                onClick={handleNextMonth}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                &gt;
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center text-gray-400 text-sm mb-1">
              {DAYS.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {Array(startOfMonth.getDay()).fill(null).map((_, i) => <div key={"empty-" + i} />)}

              {daysInMonth.map((day) => (
                <button
                  key={day}
                  className={cn(
                    "p-2 rounded-full hover:bg-blue-100 focus:outline-none transition",
                    selectedDate &&
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === currentMonth.getMonth() &&
                      selectedDate.getFullYear() === currentMonth.getFullYear()
                      ? "bg-blue-600 text-white"
                      : ""
                  )}
                  onClick={() => handleConfirm(day)}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Time input */}
            <div className="flex items-center space-x-2 mb-2">
              <Clock size={16} className="text-gray-400" />
              <input
                type="number"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                min={0}
                max={23}
                className="w-12 text-center border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="HH"
              />
              <span>:</span>
              <input
                type="number"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                min={0}
                max={59}
                className="w-12 text-center border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="MM"
              />
            </div>

            {/* Selected Date Preview */}
            {selectedDate && (
              <p className="mt-1 text-sm text-gray-600">
                Selected: {selectedDate.toLocaleString("default", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

DatetimePicker.displayName = "DatetimePicker";
