import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface CalendarProps extends React.ComponentPropsWithoutRef<"div"> {
  date?: Date;
  onChange?: (date: Date) => void;
}

export const Calendar = React.forwardRef<
  React.ElementRef<typeof React.Component>,
  CalendarProps
>(({ className, date, onChange, ...props }, ref) => {
  const [selectedDate, setSelectedDate] = React.useState(date || new Date());

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-md border p-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() - 1);
            handleDateChange(newDate);
          }}
          className="text-sm px-2 py-1 rounded hover:bg-gray-100"
        >
          Previous Month
        </button>
        <span className="text-lg font-semibold">
          {selectedDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
          })}
        </span>
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            handleDateChange(newDate);
          }}
          className="text-sm px-2 py-1 rounded hover:bg-gray-100"
        >
          Next Month
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 42 }, (_, i) => {
          const day = new Date(selectedDate);
          day.setDate(1);
          day.setDate(day.getDate() + (i - day.getDay()));

          return (
            <button
              key={i}
              onClick={() => handleDateChange(day)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                day.getMonth() !== selectedDate.getMonth() && "text-gray-400",
                day.toDateString() === selectedDate.toDateString() && "bg-primary text-white",
                day.toDateString() === date?.toDateString() && "bg-secondary text-white"
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export const CalendarTrigger = React.forwardRef<
  React.ElementRef<typeof React.Component>,
  React.ComponentPropsWithoutRef<typeof React.Component>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-md border bg-transparent p-0 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="material-icons">event</span>
    </button>
  );
});

Calendar.displayName = "Calendar";
CalendarTrigger.displayName = "CalendarTrigger";

// Export types
export type CalendarTriggerProps = React.ComponentPropsWithoutRef<typeof CalendarTrigger>;