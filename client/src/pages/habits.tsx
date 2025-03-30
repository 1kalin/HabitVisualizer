import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Habit, HabitWithCompletions } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import AddHabitDialog from "@/components/habit/add-habit-dialog";
import HabitCard from "@/components/habit/habit-card";
import { formatDateToYYYYMMDD } from "@/components/ui/date-utils";
import { Plus, ClipboardList, Search } from "lucide-react";

export default function Habits() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddHabitDialog, setShowAddHabitDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  const today = formatDateToYYYYMMDD(new Date());
  const dayOfWeek = new Date().getDay();

  // Fetch habits data
  const { data: habits, isLoading } = useQuery<HabitWithCompletions[]>({
    queryKey: ['/api/habits'],
  });

  // Determine if a habit is completed today
  const isHabitCompletedToday = (habit: HabitWithCompletions) => {
    return habit.completions.some(
      c => formatDateToYYYYMMDD(new Date(c.date)) === today && c.completed
    );
  };

  // Filter habits based on search term and active tab
  const filteredHabits = habits?.filter(habit => {
    // Search filter
    const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (habit.description && habit.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Tab filter
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "today") {
      return matchesSearch && (habit.frequencyDays as number[]).includes(dayOfWeek);
    }
    if (activeTab === "completed") {
      return matchesSearch && isHabitCompletedToday(habit);
    }
    return matchesSearch;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Habits</h1>
        <Button onClick={() => setShowAddHabitDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Habit
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Habits</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            // Loading state
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array(6).fill(null).map((_, index) => (
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
              ))}
            </div>
          ) : filteredHabits && filteredHabits.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completions={habit.completions}
                  completionRate={habit.completionRate}
                  isCompleted={isHabitCompletedToday(habit)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ClipboardList className="w-12 h-12 text-gray-400 mb-4" />
                {searchTerm ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matching habits found</h3>
                    <p className="text-gray-500 mb-4">Try a different search term or add a new habit.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
                    <p className="text-gray-500 mb-4">Start tracking your routines by adding a new habit.</p>
                  </>
                )}
                <Button onClick={() => setShowAddHabitDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Habit
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <AddHabitDialog 
        open={showAddHabitDialog} 
        onOpenChange={setShowAddHabitDialog} 
      />
    </>
  );
}
