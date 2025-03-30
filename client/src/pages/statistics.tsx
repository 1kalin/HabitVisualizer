import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { HabitStatistics as HabitStatsType, Habit } from "@shared/schema";
import HabitStatistics from "@/components/habit/habit-statistics";
import HeatmapCalendar from "@/components/habit/heatmap-calendar";
import HabitTrendChart from "@/components/habit/habit-trend-chart";
import HabitComparisonChart from "@/components/habit/habit-comparison-chart";
import { ClipboardList, CheckCircle, TrendingUp, Clock, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Statistics() {
  // Fetch statistics data
  const { data: stats, isLoading } = useQuery<HabitStatsType>({
    queryKey: ['/api/stats'],
  });
  
  // Fetch habits for individual habit trends
  const { data: habits, isLoading: isHabitsLoading } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
  });
  
  // Selected tab
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  
  // Selected habit for trend view
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
      </div>
      
      <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6 grid grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          {/* Overall Statistics Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                          {isLoading ? <Skeleton className="h-8 w-8" /> : stats?.activeHabits || 0}
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
                        Overall Completion
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                          ) : (
                            stats ? `${stats.weeklyStreak}%` : "0%"
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
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Weekly Streak
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                          ) : (
                            stats ? `${stats.weeklyStreak}%` : "0%"
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
                          {isLoading ? (
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
          
          {/* Detailed Statistics */}
          <HabitStatistics />
          
          {/* Habit Breakdown */}
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-3">Habit Insights</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-2">Best Performing Habit</h4>
                  {isLoading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : (
                    <p className="text-sm text-gray-600">
                      Based on your data, <span className="font-medium text-primary">Drink Water</span> is your most consistent habit with 100% completion rate.
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-2">Needs Improvement</h4>
                  {isLoading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : (
                    <p className="text-sm text-gray-600">
                      You could improve on <span className="font-medium text-red-600">Journal</span> which has a 30% completion rate.
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-2">Most Productive Day</h4>
                  {isLoading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : (
                    <p className="text-sm text-gray-600">
                      Your most productive day is <span className="font-medium text-primary">Thursday</span> with an average of 90% habit completion.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar">
          {/* Calendar Heatmap View */}
          <HeatmapCalendar />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          {/* Habit Selection for Trends */}
          {!isHabitsLoading && habits && habits.length > 0 && (
            <Card>
              <CardContent className="py-4">
                <div className="text-sm font-medium mb-3">Select a habit to view its trend:</div>
                <div className="flex flex-wrap gap-2">
                  {habits.map(habit => (
                    <button
                      key={habit.id}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        selectedHabitId === habit.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => setSelectedHabitId(habit.id)}
                    >
                      {habit.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Selected Habit Trend or Prompt */}
          {selectedHabitId && !isHabitsLoading && habits ? (
            <HabitTrendChart habit={habits.find(h => h.id === selectedHabitId)!} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Select a Habit</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Select a habit from the list above to view its detailed trend over time.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="comparison">
          {/* Habit Performance Comparison */}
          <HabitComparisonChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}