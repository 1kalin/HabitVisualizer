import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertHabitSchema, insertHabitCompletionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for habit management
  
  // Get all habits with their completions
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getAllHabits();
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  // Get a single habit by ID
  app.get("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }
      
      const habit = await storage.getHabit(id);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(habit);
    } catch (error) {
      console.error("Error fetching habit:", error);
      res.status(500).json({ message: "Failed to fetch habit" });
    }
  });

  // Create a new habit
  app.post("/api/habits", async (req, res) => {
    try {
      const result = insertHabitSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const newHabit = await storage.createHabit(req.body);
      res.status(201).json(newHabit);
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(500).json({ message: "Failed to create habit" });
    }
  });

  // Update a habit
  app.put("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }
      
      const result = insertHabitSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const updatedHabit = await storage.updateHabit(id, req.body);
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      console.error("Error updating habit:", error);
      res.status(500).json({ message: "Failed to update habit" });
    }
  });

  // Delete a habit
  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }
      
      const result = await storage.deleteHabit(id);
      if (!result) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json({ message: "Habit deleted successfully" });
    } catch (error) {
      console.error("Error deleting habit:", error);
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // API routes for habit completion tracking
  
  // Get all completions
  app.get("/api/habits/completions", async (req, res) => {
    try {
      const completions = await storage.getAllCompletions();
      res.json(completions);
    } catch (error) {
      console.error("Error fetching completions:", error);
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  // Track habit completion
  app.post("/api/habits/completion", async (req, res) => {
    try {
      const result = insertHabitCompletionSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const { habitId, date, completed } = req.body;
      
      // Check if habit exists
      const habit = await storage.getHabit(habitId);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Check if there's already a completion record for this habit on this date
      const existingCompletion = await storage.getCompletionByHabitAndDate(habitId, date);
      
      if (existingCompletion) {
        // Update existing completion
        const updatedCompletion = await storage.updateCompletion(existingCompletion.id, {
          ...existingCompletion,
          completed,
        });
        res.json(updatedCompletion);
      } else {
        // Create new completion record
        const newCompletion = await storage.createCompletion({
          habitId,
          date: new Date(date),
          completed,
        });
        res.status(201).json(newCompletion);
      }
    } catch (error) {
      console.error("Error tracking habit completion:", error);
      res.status(500).json({ message: "Failed to track habit completion" });
    }
  });

  // API routes for statistics
  
  // Get overall habit statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getHabitStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get weekly completion data for chart
  app.get("/api/stats/weekly", async (req, res) => {
    try {
      const weeklyData = await storage.getWeeklyCompletionData();
      res.json(weeklyData);
    } catch (error) {
      console.error("Error fetching weekly data:", error);
      res.status(500).json({ message: "Failed to fetch weekly data" });
    }
  });

  // Get habit performance data
  app.get("/api/stats/habits", async (req, res) => {
    try {
      const habitPerformance = await storage.getHabitPerformance();
      res.json(habitPerformance);
    } catch (error) {
      console.error("Error fetching habit performance:", error);
      res.status(500).json({ message: "Failed to fetch habit performance" });
    }
  });

  // Reset all habits and completions (for settings page)
  app.delete("/api/habits/reset", async (req, res) => {
    try {
      await storage.resetAllData();
      res.json({ message: "All habit data has been reset successfully" });
    } catch (error) {
      console.error("Error resetting data:", error);
      res.status(500).json({ message: "Failed to reset data" });
    }
  });

  // API routes for settings
  
  // Save settings
  app.post("/api/settings", async (req, res) => {
    // For now, just return success as settings are not persisted in this version
    res.json({ message: "Settings saved successfully" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
