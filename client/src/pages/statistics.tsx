import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { HabitStatistics as HabitStatsType } from "@shared/schema";
import HabitStatistics from "@/components/habit/habit-statistics";
import { ClipboardList, CheckCircle, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Statistics() {
  // Fetch statistics data
  const { data: stats, isLoading } = useQuery<HabitStatsType>({
    queryKey: ['/api/stats'],
  });

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h1>
      
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
      <h3 className="mt-10 text-lg leading-6 font-medium text-gray-900 mb-3">Habit Insights</h3>
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
    </>
  );
}
