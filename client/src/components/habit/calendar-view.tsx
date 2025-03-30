import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HabitCompletion, Habit } from "@shared/schema";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD } from "../ui/date-utils";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarDay = {
  date: Date;
  completedHabits: number;
  totalHabits: number;
  isCompleted: boolean;
  isMissed: boolean;
};

export default function CalendarView() {
  const [date, setDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  // Get habits and completions
  const { data: habits, isLoading } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
  });

  const { data: completions, isLoading: isCompletionsLoading } = useQuery<HabitCompletion[]>({
    queryKey: ['/api/habits/completions'],
  });

  if (isLoading || isCompletionsLoading || !habits || !completions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-96">
          <div className="text-sm text-gray-500">Loading calendar data...</div>
        </CardContent>
      </Card>
    );
  }

  const getCompletionsForDate = (date: Date) => {
    const dateStr = formatDateToYYYYMMDD(date);
    return completions.filter(
      completion => formatDateToYYYYMMDD(new Date(completion.date)) === dateStr
    );
  };

  const getHabitsForDayOfWeek = (date: Date) => {
    const dayOfWeek = date.getDay();
    return habits.filter(habit => 
      (habit.frequencyDays as number[]).includes(dayOfWeek)
    );
  };

  const getDayStatus = (date: Date): CalendarDay => {
    const dateCompletions = getCompletionsForDate(date);
    const applicableHabits = getHabitsForDayOfWeek(date);
    
    // Count any habit that has a completion marked as completed for this date
    const completedHabits = dateCompletions.filter(c => c.completed).length;
    
    // Total habits is the number of habits scheduled for that day
    const totalHabits = applicableHabits.length;
    
    // A day is considered complete if all scheduled habits are completed
    // or if there are completions but no scheduled habits (completed extra habits)
    const isCompleted = (totalHabits > 0 && completedHabits >= totalHabits) || 
                        (totalHabits === 0 && completedHabits > 0);
                        
    // A day is considered missed if some habits are incomplete and the date is in the past
    const isMissed = totalHabits > 0 && completedHabits < totalHabits && 
                     date < new Date(new Date().setHours(0,0,0,0));
    
    return {
      date,
      completedHabits,
      totalHabits,
      isCompleted,
      isMissed,
    };
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setMonth(newMonth);
  };

  const selectedStatus = getDayStatus(date);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Calendar View</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <div className="text-sm font-medium">
            {month.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && setDate(newDate)}
          month={month}
          onMonthChange={setMonth}
          className="rounded-md border"
          modifiers={{
            completed: (day) => getDayStatus(day).isCompleted,
            missed: (day) => getDayStatus(day).isMissed,
            hasHabits: (day) => 
              getDayStatus(day).completedHabits > 0 || 
              getDayStatus(day).totalHabits > 0
          }}
          modifiersClassNames={{
            completed: "bg-green-600 text-white hover:bg-green-700",
            missed: "bg-red-600 text-white hover:bg-red-700"
          }}
        />
        
        {/* Calendar day details */}
        <div className="mt-2 pt-2 border-t">
          <div className="text-sm font-medium mb-1">
            Selected Day: {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </div>
          
          {(selectedStatus.completedHabits > 0 || selectedStatus.totalHabits > 0) ? (
            <div className="text-sm">
              <span className="text-gray-600">Completed habits:</span> 
              <span className="font-medium ml-1">{selectedStatus.completedHabits} of {selectedStatus.totalHabits || "unscheduled"}</span>
              {selectedStatus.isCompleted && (
                <span className="text-green-600 text-xs ml-2">✓ All completed</span>
              )}
              {selectedStatus.isMissed && (
                <span className="text-red-600 text-xs ml-2">✗ Some missed</span>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No habits tracked for this day</div>
          )}
          
          <div className="text-xs text-gray-500 mt-1">
            Click on any day to see details
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Missed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-primary bg-primary-50 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
