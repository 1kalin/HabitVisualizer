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
    
    const completedHabits = dateCompletions.filter(c => c.completed).length;
    const totalHabits = applicableHabits.length;
    
    return {
      date,
      completedHabits,
      totalHabits,
      isCompleted: totalHabits > 0 && completedHabits === totalHabits,
      isMissed: totalHabits > 0 && completedHabits < totalHabits && date < new Date(new Date().setHours(0,0,0,0)),
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
          components={{
            Day: ({ day, ...props }) => {
              const dayStatus = getDayStatus(day);
              return (
                <div
                  {...props}
                  className={cn(
                    props.className,
                    "relative",
                    dayStatus.isCompleted && "bg-green-600 text-white hover:bg-green-700",
                    dayStatus.isMissed && "bg-red-600 text-white hover:bg-red-700"
                  )}
                >
                  {props.children}
                  {dayStatus.totalHabits > 0 && (
                    <div className="absolute bottom-1 left-0 right-0 text-[8px] text-center">
                      {dayStatus.completedHabits}/{dayStatus.totalHabits}
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
        
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
