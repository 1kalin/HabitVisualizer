import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Days of the week for habit frequency
export const DaysOfWeek = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export type DayOfWeek = typeof DaysOfWeek[keyof typeof DaysOfWeek];

// Habit schema
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#4F46E5"),
  frequencyDays: jsonb("frequency_days").notNull().$type<DayOfWeek[]>(),
  reminderTime: text("reminder_time"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

// Habit completion tracking
export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id),
  date: timestamp("date").notNull(),
  completed: boolean("completed").default(true),
  userId: integer("user_id").references(() => users.id),
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).omit({
  id: true,
});

export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;
export type HabitCompletion = typeof habitCompletions.$inferSelect;

// Statistics type for frontend
export type HabitStatistics = {
  activeHabits: number;
  completedToday: number;
  totalToday: number;
  weeklyStreak: number;
  longestStreak: number;
};

export type HabitWithCompletions = Habit & {
  completions: HabitCompletion[];
  completionRate: number;
};

export type WeeklyCompletionData = {
  day: string;
  completionRate: number;
};

export type HabitPerformance = {
  habitId: number;
  habitName: string;
  completionRate: number;
};
