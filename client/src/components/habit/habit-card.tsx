import { Habit, HabitCompletion } from "@shared/schema";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD } from "../ui/date-utils";

interface HabitCardProps {
  habit: Habit;
  completions: HabitCompletion[];
  completionRate: number;
  isCompleted: boolean;
}

export default function HabitCard({ habit, completions, completionRate, isCompleted }: HabitCardProps) {
  const [completed, setCompleted] = useState(isCompleted);

  const toggleHabitMutation = useMutation({
    mutationFn: async () => {
      const today = formatDateToYYYYMMDD(new Date());
      const response = await apiRequest(
        "POST", 
        "/api/habits/completion", 
        { 
          habitId: habit.id, 
          date: today, 
          completed: !completed 
        }
      );
      return response.json();
    },
    onSuccess: () => {
      setCompleted(!completed);
      
      // More aggressive invalidation strategy to ensure all UI elements update
      // Be specific about which queries to invalidate for better performance
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/completions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/weekly'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/comparison'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/heatmap'] });
    }
  });

  // Get last 7 days of completions for streak dots
  const lastSevenDaysStreaks = () => {
    const today = new Date();
    const streaks = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = formatDateToYYYYMMDD(date);
      
      const completion = completions.find(
        c => formatDateToYYYYMMDD(new Date(c.date)) === dateStr
      );
      
      streaks.push(completion?.completed || false);
    }
    
    return streaks;
  };

  const streaks = lastSevenDaysStreaks();

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-all">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-900">{habit.name}</h4>
            <p className="text-sm text-gray-500">{habit.description}</p>
          </div>
          <div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full p-1.5",
                completed ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 hover:bg-gray-400",
                "text-white"
              )}
              onClick={() => toggleHabitMutation.mutate()}
              disabled={toggleHabitMutation.isPending}
            >
              <Check className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className={cn(
                "h-2 rounded-full",
                completionRate >= 70 ? "bg-green-600" :
                completionRate >= 40 ? "bg-amber-500" : "bg-red-600"
              )} 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">Weekly completion</p>
            <p className="text-xs font-medium text-gray-900">{completionRate}%</p>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-1">
          {streaks.map((isComplete, index) => (
            <div 
              key={index} 
              className={cn(
                "w-2.5 h-2.5 rounded-full", 
                isComplete ? "bg-green-600" : "bg-gray-300"
              )}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
