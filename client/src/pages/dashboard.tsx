import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Habit, HabitWithCompletions, HabitStatistics } from "@shared/schema";
import { getFormattedDate, formatDateToYYYYMMDD } from "@/components/ui/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AddHabitDialog from "@/components/habit/add-habit-dialog";
import HabitCard from "@/components/habit/habit-card";
import { Plus, ClipboardList, CheckCircle, TrendingUp, Clock } from "lucide-react";
import CalendarView from "@/components/habit/calendar-view";
import HabitStatsComponent from "@/components/habit/habit-statistics";

export default function Dashboard() {
  const [showAddHabitDialog, setShowAddHabitDialog] = useState(false);
  const today = formatDateToYYYYMMDD(new Date());

  // Fetch habits data
  const { data: habits, isLoading: isLoadingHabits } = useQuery<HabitWithCompletions[]>({
    queryKey: ['/api/habits'],
  });

  // Fetch statistics data
  const { data: stats, isLoading: isLoadingStats } = useQuery<HabitStatistics>({
    queryKey: ['/api/stats'],
  });

  // Determine if a habit is completed today
  const isHabitCompletedToday = (habit: HabitWithCompletions) => {
    return habit.completions.some(
      c => formatDateToYYYYMMDD(new Date(c.date)) === today && c.completed
    );
  };

  // Filter habits for today based on frequency AND show any completed today
  const todaysHabits = habits ? habits.filter(habit => {
    const dayOfWeek = new Date().getDay();
    // Include the habit if it's scheduled for today OR it has been completed today
    return (habit.frequencyDays as number[]).includes(dayOfWeek) || isHabitCompletedToday(habit);
  }) : [];

  return (
    <>
      {/* Dashboard Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>{getFormattedDate()}</span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex md:mt-0 md:ml-4">
          <Button 
            className="inline-flex items-center" 
            onClick={() => setShowAddHabitDialog(true)}
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add New Habit
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardList className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Habits
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {isLoadingStats ? (
                        <Skeleton className="h-8 w-8" />
                      ) : (
                        stats?.activeHabits || 0
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed Today
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {isLoadingStats ? (
                        <Skeleton className="h-8 w-8" />
                      ) : (
                        stats?.completedToday || 0
                      )}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <span>of {stats?.totalToday || 0}</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Weekly Streak
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {isLoadingStats ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        `${stats?.weeklyStreak || 0}%`
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Longest Streak
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {isLoadingStats ? (
                        <Skeleton className="h-8 w-8" />
                      ) : (
                        stats?.longestStreak || 0
                      )}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                      days
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Today's Habits */}
      <h3 className="mt-10 text-lg leading-6 font-medium text-gray-900">Today's Habits</h3>
      <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoadingHabits ? (
          // Loading state
          Array(3).fill(null).map((_, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <div className="flex space-x-1">
                    {Array(7).fill(null).map((_, i) => (
                      <Skeleton key={i} className="h-2 w-2 rounded-full" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : todaysHabits.length > 0 ? (
          // Display today's habits
          todaysHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completions={habit.completions}
              completionRate={habit.completionRate}
              isCompleted={isHabitCompletedToday(habit)}
            />
          ))
        ) : (
          // No habits for today
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <ClipboardList className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No habits scheduled for today</h3>
              <p className="text-gray-500 mb-4">Add a new habit or check back tomorrow.</p>
              <Button onClick={() => setShowAddHabitDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Habit
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Add Habit Card */}
        {habits && habits.length > 0 && (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center cursor-pointer hover:border-gray-400"
            onClick={() => setShowAddHabitDialog(true)}
          >
            <Button variant="default" size="sm">
              <Plus className="-ml-0.5 mr-2 h-4 w-4" />
              Add New Habit
            </Button>
          </div>
        )}
      </div>
      
      {/* Calendar View */}
      <h3 className="mt-10 text-lg leading-6 font-medium text-gray-900">Calendar View</h3>
      <div className="mt-3">
        <CalendarView />
      </div>
      
      {/* Statistics */}
      <h3 className="mt-10 text-lg leading-6 font-medium text-gray-900">Statistics</h3>
      <div className="mt-3">
        <HabitStatsComponent />
      </div>
      
      {/* Add Habit Dialog */}
      <AddHabitDialog 
        open={showAddHabitDialog} 
        onOpenChange={setShowAddHabitDialog} 
      />
    </>
  );
}
