import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { HabitPerformance, WeeklyCompletionData } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function WeeklyCompletionChart() {
  const { data, isLoading } = useQuery<WeeklyCompletionData[]>({
    queryKey: ['/api/stats/weekly'],
  });

  if (isLoading || !data) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Calculate average weekly completion
  const average = data.reduce((sum, day) => sum + day.completionRate, 0) / data.length;

  return (
    <>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Completion Rate']}
            labelFormatter={(label) => `${label}`}
          />
          <Bar dataKey="completionRate" fill="#4F46E5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Average weekly completion: <span className="font-medium text-gray-900">{average.toFixed(0)}%</span>
        </p>
      </div>
    </>
  );
}

export function HabitPerformanceChart() {
  const { data, isLoading } = useQuery<HabitPerformance[]>({
    queryKey: ['/api/stats/habits'],
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Sort by completion rate (highest first)
  const sortedData = [...data].sort((a, b) => b.completionRate - a.completionRate);

  return (
    <div className="space-y-4">
      {sortedData.map((habit) => (
        <div key={habit.habitId}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-900">{habit.habitName}</div>
            <div className="text-sm text-gray-500">{habit.completionRate}%</div>
          </div>
          <Progress 
            value={habit.completionRate} 
            className={`h-2 mt-1 ${
              habit.completionRate >= 70 ? "bg-green-200" : 
              habit.completionRate >= 40 ? "bg-amber-200" : "bg-red-200"
            }`}
            indicatorClassName={`${
              habit.completionRate >= 70 ? "bg-green-600" : 
              habit.completionRate >= 40 ? "bg-amber-500" : "bg-red-600"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export default function HabitStatistics() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Weekly Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyCompletionChart />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Habit Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitPerformanceChart />
        </CardContent>
      </Card>
    </div>
  );
}
