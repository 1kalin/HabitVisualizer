import { 
  InsertHabit, 
  Habit, 
  InsertHabitCompletion, 
  HabitCompletion,
  HabitStatistics,
  HabitWithCompletions,
  WeeklyCompletionData,
  HabitPerformance,
  DaysOfWeek,
  DayOfWeek
} from "@shared/schema";

// Helper functions
function formatDateToYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getWeekDates(date: Date = new Date()): Date[] {
  const result = [];
  const day = date.getDay(); // Get current day index (0 = Sunday, 6 = Saturday)
  
  // Get the date of Sunday (start of week)
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - day);
  
  // Create an array of dates for each day of the week
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    result.push(d);
  }
  
  return result;
}

export interface IStorage {
  // Habit CRUD operations
  getAllHabits(): Promise<HabitWithCompletions[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: InsertHabit): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Habit completion operations
  getAllCompletions(): Promise<HabitCompletion[]>;
  getCompletionByHabitAndDate(habitId: number, date: string): Promise<HabitCompletion | undefined>;
  createCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  updateCompletion(id: number, completion: HabitCompletion): Promise<HabitCompletion>;
  
  // Statistics operations
  getHabitStatistics(): Promise<HabitStatistics>;
  getWeeklyCompletionData(): Promise<WeeklyCompletionData[]>;
  getHabitPerformance(): Promise<HabitPerformance[]>;
  
  // Data management
  resetAllData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private habits: Map<number, Habit>;
  private completions: Map<number, HabitCompletion>;
  private habitCounter: number;
  private completionCounter: number;
  
  constructor() {
    this.habits = new Map();
    this.completions = new Map();
    this.habitCounter = 1;
    this.completionCounter = 1;
    
    // Add some sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Sample habits
    const sampleHabits: InsertHabit[] = [
      {
        name: "Morning Workout",
        description: "30 minutes of exercise",
        color: "#4F46E5",
        frequencyDays: [1, 2, 3, 4, 5],
        reminderTime: "07:00",
      },
      {
        name: "Read Book",
        description: "20 pages daily",
        color: "#10B981",
        frequencyDays: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: "21:00",
      },
      {
        name: "Meditation",
        description: "10 minutes of mindfulness",
        color: "#F59E0B",
        frequencyDays: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: "08:00",
      },
      {
        name: "Drink Water",
        description: "8 glasses daily",
        color: "#4F46E5",
        frequencyDays: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: "",
      },
      {
        name: "Journal",
        description: "Write daily thoughts",
        color: "#DC2626",
        frequencyDays: [1, 2, 3, 4, 5],
        reminderTime: "20:00",
      }
    ];
    
    // Create sample habits
    sampleHabits.forEach(habit => {
      this.createHabit(habit);
    });
    
    // Create sample completions for the past 14 days
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // For each habit, decide if it was completed on this date
      // Based on the habit's frequency and some randomness for variety
      for (let habitId = 1; habitId <= sampleHabits.length; habitId++) {
        const habit = this.habits.get(habitId);
        if (!habit) continue;
        
        const dayOfWeek = date.getDay();
        const isHabitDayOfWeek = (habit.frequencyDays as number[]).includes(dayOfWeek);
        
        if (isHabitDayOfWeek) {
          // Different completion patterns for different habits
          let completed = false;
          
          if (habitId === 1) { // Morning Workout: 75% completion
            completed = Math.random() < 0.75;
          } else if (habitId === 2) { // Read Book: 90% completion
            completed = Math.random() < 0.9;
          } else if (habitId === 3) { // Meditation: 60% completion
            completed = Math.random() < 0.6;
          } else if (habitId === 4) { // Drink Water: 100% completion
            completed = true;
          } else if (habitId === 5) { // Journal: 30% completion
            completed = Math.random() < 0.3;
          }
          
          this.createCompletion({
            habitId,
            date,
            completed,
          });
        }
      }
    }
  }
  
  async getAllHabits(): Promise<HabitWithCompletions[]> {
    const habits = Array.from(this.habits.values());
    const completions = Array.from(this.completions.values());
    
    return habits.map(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      
      // Calculate completion rate for the last 7 days
      const weeklyCompletionRate = this.calculateCompletionRate(habit.id);
      
      return {
        ...habit,
        completions: habitCompletions,
        completionRate: weeklyCompletionRate,
      };
    });
  }
  
  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }
  
  async createHabit(habitData: InsertHabit): Promise<Habit> {
    const id = this.habitCounter++;
    const now = new Date();
    
    // Create a properly typed Habit object with defaults for null values
    const habit: Habit = {
      id,
      name: habitData.name,
      description: habitData.description ?? null,
      color: habitData.color ?? null,
      frequencyDays: habitData.frequencyDays, // Use as is, since it's already the correct type
      reminderTime: habitData.reminderTime ?? null,
      createdAt: now,
      userId: habitData.userId ?? null,
    };
    
    this.habits.set(id, habit);
    return habit;
  }
  
  async updateHabit(id: number, habitData: InsertHabit): Promise<Habit | undefined> {
    const existingHabit = this.habits.get(id);
    if (!existingHabit) return undefined;
    
    // Create a properly typed updated Habit object
    const updatedHabit: Habit = {
      id,
      name: habitData.name ?? existingHabit.name,
      description: habitData.description ?? existingHabit.description,
      color: habitData.color ?? existingHabit.color,
      frequencyDays: habitData.frequencyDays ?? existingHabit.frequencyDays,
      reminderTime: habitData.reminderTime ?? existingHabit.reminderTime,
      createdAt: existingHabit.createdAt,
      userId: habitData.userId ?? existingHabit.userId,
    };
    
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }
  
  async deleteHabit(id: number): Promise<boolean> {
    const deleted = this.habits.delete(id);
    
    // Also delete all completions for this habit
    if (deleted) {
      const completionsToDelete: number[] = [];
      
      this.completions.forEach((completion, completionId) => {
        if (completion.habitId === id) {
          completionsToDelete.push(completionId);
        }
      });
      
      completionsToDelete.forEach(completionId => {
        this.completions.delete(completionId);
      });
    }
    
    return deleted;
  }
  
  async getAllCompletions(): Promise<HabitCompletion[]> {
    return Array.from(this.completions.values());
  }
  
  async getCompletionByHabitAndDate(habitId: number, dateStr: string): Promise<HabitCompletion | undefined> {
    const allCompletions = Array.from(this.completions.values());
    return allCompletions.find(
      completion => 
        completion.habitId === habitId && 
        formatDateToYYYYMMDD(new Date(completion.date)) === dateStr
    );
  }
  
  async createCompletion(completionData: InsertHabitCompletion): Promise<HabitCompletion> {
    const id = this.completionCounter++;
    
    // Create a properly typed HabitCompletion object
    const completion: HabitCompletion = {
      id,
      habitId: completionData.habitId,
      date: typeof completionData.date === 'string' 
        ? new Date(completionData.date) 
        : completionData.date as Date,
      completed: completionData.completed ?? true,
      userId: completionData.userId ?? null
    };
    
    this.completions.set(id, completion);
    return completion;
  }
  
  async updateCompletion(id: number, completionData: HabitCompletion): Promise<HabitCompletion> {
    this.completions.set(id, completionData);
    return completionData;
  }
  
  async getHabitStatistics(): Promise<HabitStatistics> {
    const habits = Array.from(this.habits.values());
    const completions = Array.from(this.completions.values());
    const today = formatDateToYYYYMMDD(new Date());
    const dayOfWeek = new Date().getDay();
    
    // Count active habits
    const activeHabits = habits.length;
    
    // Count habits for today based on frequency
    const habitsForToday = habits.filter(habit => 
      (habit.frequencyDays as number[]).includes(dayOfWeek)
    ).length;
    
    // Count completed habits for today
    const completedToday = completions.filter(c => {
      // Ensure we properly handle both string and Date objects
      const completionDate = typeof c.date === 'string' 
        ? formatDateToYYYYMMDD(new Date(c.date))
        : formatDateToYYYYMMDD(c.date as Date);
      
      return completionDate === today && c.completed;
    }).length;
    
    // Calculate weekly streak
    const weeklyStreak = this.calculateOverallCompletionRate();
    
    // Calculate longest streak (naive implementation for demo)
    const longestStreak = 32; // Mock value for demo
    
    return {
      activeHabits,
      completedToday,
      totalToday: habitsForToday,
      weeklyStreak,
      longestStreak,
    };
  }
  
  async getWeeklyCompletionData(): Promise<WeeklyCompletionData[]> {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekDates = getWeekDates();
    
    return weekDates.map((date, index) => {
      const dateStr = formatDateToYYYYMMDD(date);
      const dayOfWeek = date.getDay();
      
      // Get habits scheduled for this day of week
      const habitsForDay = Array.from(this.habits.values()).filter(
        habit => (habit.frequencyDays as number[]).includes(dayOfWeek)
      );
      
      // Count completions for this date
      const completionsForDate = Array.from(this.completions.values()).filter(c => {
        // Ensure we properly handle both string and Date objects
        const completionDate = typeof c.date === 'string' 
          ? formatDateToYYYYMMDD(new Date(c.date))
          : formatDateToYYYYMMDD(c.date as Date);
        
        return completionDate === dateStr && c.completed;
      });
      
      // Calculate completion rate
      const completionRate = habitsForDay.length === 0 
        ? 0 
        : Math.round((completionsForDate.length / habitsForDay.length) * 100);
      
      return {
        day: weekDays[dayOfWeek],
        completionRate,
      };
    });
  }
  
  async getHabitPerformance(): Promise<HabitPerformance[]> {
    const habits = Array.from(this.habits.values());
    
    return habits.map(habit => {
      return {
        habitId: habit.id,
        habitName: habit.name,
        completionRate: this.calculateCompletionRate(habit.id),
      };
    });
  }
  
  async resetAllData(): Promise<void> {
    this.habits.clear();
    this.completions.clear();
    this.habitCounter = 1;
    this.completionCounter = 1;
  }
  
  // Helper methods
  private calculateCompletionRate(habitId: number): number {
    const habit = this.habits.get(habitId);
    if (!habit) return 0;
    
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    let scheduledDays = 0;
    let completedDays = 0;
    
    // Check each day in the last week
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatDateToYYYYMMDD(date);
      
      // Check if habit is scheduled for this day
      const dayOfWeek = date.getDay();
      const isScheduled = (habit.frequencyDays as number[]).includes(dayOfWeek);
      
      if (isScheduled) {
        scheduledDays++;
        
        // Check if it was completed
        const wasCompleted = Array.from(this.completions.values()).some(c => {
          // Ensure we properly handle both string and Date objects
          const completionDate = typeof c.date === 'string' 
            ? formatDateToYYYYMMDD(new Date(c.date))
            : formatDateToYYYYMMDD(c.date as Date);
          
          return c.habitId === habitId && completionDate === dateStr && c.completed;
        });
        
        if (wasCompleted) {
          completedDays++;
        }
      }
    }
    
    return scheduledDays === 0 ? 0 : Math.round((completedDays / scheduledDays) * 100);
  }
  
  private calculateOverallCompletionRate(): number {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    let totalScheduled = 0;
    let totalCompleted = 0;
    
    // For each day in the last week
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatDateToYYYYMMDD(date);
      const dayOfWeek = date.getDay();
      
      // Get habits scheduled for this day
      const habitsForDay = Array.from(this.habits.values()).filter(
        habit => (habit.frequencyDays as number[]).includes(dayOfWeek)
      );
      
      totalScheduled += habitsForDay.length;
      
      // Count completions for this date
      for (const habit of habitsForDay) {
        const completed = Array.from(this.completions.values()).some(c => {
          // Ensure we properly handle both string and Date objects
          const completionDate = typeof c.date === 'string' 
            ? formatDateToYYYYMMDD(new Date(c.date))
            : formatDateToYYYYMMDD(c.date as Date);
          
          return c.habitId === habit.id && completionDate === dateStr && c.completed;
        });
        
        if (completed) {
          totalCompleted++;
        }
      }
    }
    
    return totalScheduled === 0 ? 0 : Math.round((totalCompleted / totalScheduled) * 100);
  }
}

export const storage = new MemStorage();
