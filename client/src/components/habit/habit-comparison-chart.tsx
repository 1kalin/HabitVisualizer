import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitComparisonData } from "@shared/schema";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend, 
  Cell
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HabitComparisonChart() {
  // Fetch habit comparison data
  const { data, isLoading } = useQuery<HabitComparisonData[]>({
    queryKey: ['/api/stats/comparison'],
  });
  
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Habit Week-over-Week Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // Limit data to top 5 habits for better visualization
  const limitedData = data.slice(0, 5);
  
  // Process data for chart
  const chartData = limitedData.map(item => ({
    name: item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name,
    fullName: item.name,
    currentWeek: item.currentWeek,
    previousWeek: item.previousWeek,
    change: item.change
  }));
  
  // Function to get trend icon based on change
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };
  
  // Function to get colored badge based on change
  const getChangeBadge = (change: number) => {
    let variant: "default" | "outline" | "secondary" | "destructive" = "default";
    if (change > 10) variant = "default"; // Green
    else if (change > 0) variant = "secondary"; // Gray
    else if (change === 0) variant = "outline"; // Outline
    else variant = "destructive"; // Red
    
    return (
      <Badge variant={variant} className="ml-2">
        {change > 0 ? "+" : ""}{change}%
      </Badge>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Habit Week-over-Week Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 70 }}
            barGap={0}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              interval={0} 
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`} 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => {
                const formattedName = name === "currentWeek" 
                  ? "Current Week" 
                  : "Previous Week";
                return [`${value}%`, formattedName];
              }}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.name === label);
                return item?.fullName || label;
              }}
            />
            <Legend 
              verticalAlign="top" 
              align="right"
              formatter={(value) => {
                return value === "currentWeek" ? "Current Week" : "Previous Week";
              }}
            />
            <Bar 
              dataKey="previousWeek" 
              fill="#94A3B8" 
              name="previousWeek"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="currentWeek" 
              fill="#4F46E5" 
              name="currentWeek"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-6 space-y-3">
          <div className="text-sm font-medium">Most Improved Habits</div>
          {limitedData.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center">
                {getTrendIcon(item.change)}
                <span className="ml-2 text-sm">{item.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium">{item.currentWeek}%</span>
                {getChangeBadge(item.change)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}