import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthlyHeatmapData } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function HeatmapCalendar() {
  const currentDate = new Date();
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  
  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Generate an array of years (current year - 3 to current year + 1)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 3 + i);
  
  // Fetch heatmap data
  const { data, isLoading, refetch } = useQuery<MonthlyHeatmapData[]>({
    queryKey: ['/api/stats/heatmap', year, month],
    enabled: true,
  });
  
  // Re-fetch data when year or month changes
  useEffect(() => {
    refetch();
  }, [year, month, refetch]);
  
  // Handle month navigation
  const handlePreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };
  
  // Function to determine color based on completion value
  const getHeatColor = (value: number) => {
    if (value === 0) return "bg-gray-100";
    if (value < 25) return "bg-red-200";
    if (value < 50) return "bg-orange-200";
    if (value < 75) return "bg-yellow-200";
    if (value < 100) return "bg-lime-200";
    return "bg-green-500";
  };

  // Function to get day of week for the first day of the month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };
  
  // Function to get number of days in a month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  // Generate calendar grid
  const renderCalendarGrid = () => {
    if (isLoading || !data) {
      return (
        <div className="grid grid-cols-7 gap-1 mt-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      );
    }
    
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInMonth = getDaysInMonth(year, month);
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Calendar header (day labels)
    const header = dayLabels.map(day => (
      <div key={day} className="text-center text-xs font-medium text-gray-500">
        {day}
      </div>
    ));
    
    // Calendar days
    const days = [];
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 rounded-md"></div>
      );
    }
    
    // Add cells for each day in the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayData = data.find(d => {
        const dateStr = d.date.split('-')[2]; // Get day part from YYYY-MM-DD
        return parseInt(dateStr) === i;
      });
      
      const value = dayData?.value || 0;
      const colorClass = getHeatColor(value);
      
      days.push(
        <TooltipProvider key={i}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={`h-10 flex items-center justify-center rounded-md ${colorClass} relative cursor-pointer transition-colors hover:opacity-80`}
              >
                <span className="text-xs font-medium">{i}</span>
                {dayData && dayData.habits > 0 && (
                  <span className="absolute bottom-1 text-[8px] text-gray-600">
                    {dayData.completed}/{dayData.habits}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {dayData ? (
                <>
                  <p className="font-medium">{`${year}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`}</p>
                  <p>Completion: {value}%</p>
                  <p>Habits: {dayData.completed}/{dayData.habits}</p>
                </>
              ) : (
                <p>No data available</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-1 mt-4">
        {header}
        {days}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Habit Heatmap</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous month</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <Select 
                value={month.toString()} 
                onValueChange={(value) => setMonth(parseInt(value))}
              >
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={year.toString()}
                onValueChange={(value) => setYear(parseInt(value))}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderCalendarGrid()}
        
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded-md mr-2"></div>
            <span className="text-sm text-gray-600">0%</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-200 rounded-md mr-2"></div>
            <span className="text-sm text-gray-600">1-25%</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-200 rounded-md mr-2"></div>
            <span className="text-sm text-gray-600">26-50%</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-200 rounded-md mr-2"></div>
            <span className="text-sm text-gray-600">51-75%</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-lime-200 rounded-md mr-2"></div>
            <span className="text-sm text-gray-600">76-99%</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-md mr-2"></div>
            <span className="text-sm text-gray-600">100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}