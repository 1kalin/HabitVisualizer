import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Habit, HabitCompletion } from "@shared/schema";
import CalendarView from "@/components/habit/calendar-view";
import { formatDateToYYYYMMDD } from "@/components/ui/date-utils";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch habits and completions
  const { data: habits, isLoading: isHabitsLoading } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
  });

  const { data: completions, isLoading: isCompletionsLoading } = useQuery<HabitCompletion[]>({
    queryKey: ['/api/habits/completions'],
  });

  // Get habits for the selected date based on frequency
  const getHabitsForSelectedDate = () => {
    if (!habits) return [];
    
    const dayOfWeek = selectedDate.getDay();
    return habits.filter(habit => 
      (habit.frequencyDays as number[]).includes(dayOfWeek)
    );
  };

  // Get completions for the selected date
  const getCompletionsForSelectedDate = () => {
    if (!completions) return [];
    
    const dateStr = formatDateToYYYYMMDD(selectedDate);
    return completions.filter(
      completion => formatDateToYYYYMMDD(new Date(completion.date)) === dateStr
    );
  };

  const selectedDateHabits = getHabitsForSelectedDate();
  const selectedDateCompletions = getCompletionsForSelectedDate();

  // Get habit name by ID
  const getHabitName = (habitId: number) => {
    const habit = habits?.find(h => h.id === habitId);
    return habit?.name || 'Unknown Habit';
  };

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendar</h1>
      
      <CalendarView />
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Habits for {formatSelectedDate()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isHabitsLoading || isCompletionsLoading ? (
              <p className="text-gray-500 text-sm">Loading habits...</p>
            ) : selectedDateHabits.length > 0 ? (
              <div className="space-y-2">
                {selectedDateHabits.map(habit => {
                  const isCompleted = selectedDateCompletions.some(
                    c => c.habitId === habit.id && c.completed
                  );
                  
                  return (
                    <div 
                      key={habit.id}
                      className="flex items-center justify-between p-3 rounded-md border border-gray-200"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{habit.name}</h4>
                        {habit.description && (
                          <p className="text-xs text-gray-500">{habit.description}</p>
                        )}
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full ${isCompleted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                          {isCompleted ? 'Completed' : 'Not Done'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No habits scheduled for this date.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
