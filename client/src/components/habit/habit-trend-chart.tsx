import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitTrendData, Habit } from "@shared/schema";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface HabitTrendChartProps {
  habit: Habit;
}

export default function HabitTrendChart({ habit }: HabitTrendChartProps) {
  // Fetch habit trend data
  const { data, isLoading } = useQuery<HabitTrendData[]>({
    queryKey: ['/api/stats/trends', habit.id],
  });
  
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            <Skeleton className="h-6 w-36" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // Calculate trend
  const dataPoints = data.length;
  const currentWeek = data[dataPoints - 1]?.completionRate || 0;
  const previousWeek = data[dataPoints - 2]?.completionRate || 0;
  const change = currentWeek - previousWeek;
  const trendDirection = change >= 0 ? "up" : "down";
  
  // Calculate average completion rate
  const average = data.reduce((sum, item) => sum + item.completionRate, 0) / data.length;
  
  // Set color based on trend
  const trendColor = trendDirection === "up" ? "#10B981" : "#EF4444";
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center">
            <span 
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: habit.color || "#4F46E5" }}
            />
            {habit.name} Trends
          </CardTitle>
          <div className="flex items-center">
            <div className={`flex items-center ${trendDirection === "up" ? "text-green-600" : "text-red-600"}`}>
              {trendDirection === "up" ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Completion Rate']}
              labelFormatter={(label) => `Week: ${label}`}
            />
            <ReferenceLine y={average} stroke="#9CA3AF" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="completionRate"
              stroke={habit.color || "#4F46E5"}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: habit.color || "#4F46E5", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Current Week:</div>
            <div className="text-sm font-medium">{currentWeek}%</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Average:</div>
            <div className="text-sm font-medium">{Math.round(average)}%</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Week over Week:</div>
            <div className={`text-sm font-medium flex items-center ${trendDirection === "up" ? "text-green-600" : "text-red-600"}`}>
              {trendDirection === "up" ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {change > 0 ? "+" : ""}{change}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}