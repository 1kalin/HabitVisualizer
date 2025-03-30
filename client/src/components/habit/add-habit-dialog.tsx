import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertHabitSchema, DaysOfWeek } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { X, Plus } from "lucide-react";

// Extend the schema with validation rules
const formSchema = insertHabitSchema.extend({
  name: z.string().min(1, "Habit name is required"),
  frequencyDays: z.array(z.number()).min(1, "Select at least one day"),
});

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEEK_DAYS = [
  { value: DaysOfWeek.SUNDAY, label: "S" },
  { value: DaysOfWeek.MONDAY, label: "M" },
  { value: DaysOfWeek.TUESDAY, label: "T" },
  { value: DaysOfWeek.WEDNESDAY, label: "W" },
  { value: DaysOfWeek.THURSDAY, label: "T" },
  { value: DaysOfWeek.FRIDAY, label: "F" },
  { value: DaysOfWeek.SATURDAY, label: "S" },
];

const COLOR_OPTIONS = [
  "#4F46E5", // Primary (indigo)
  "#10B981", // Success (green)
  "#F59E0B", // Warning (amber)
  "#DC2626", // Danger (red)
  "#6B7280", // Gray
];

export default function AddHabitDialog({ open, onOpenChange }: AddHabitDialogProps) {
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      frequencyDays: [1, 2, 3, 4, 5], // Default to weekdays
      reminderTime: "",
      color: COLOR_OPTIONS[0],
    },
  });

  const addHabitMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/habits", {
        ...values,
        color: selectedColor,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Habit created",
        description: "Your new habit has been created successfully.",
      });
      
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addHabitMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add New Habit
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Morning Run" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Run for 30 minutes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="frequencyDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="multiple"
                      className="grid grid-cols-7 gap-2 justify-between"
                      value={field.value.map(String)}
                      onValueChange={(value) => {
                        field.onChange(value.map(Number));
                      }}
                    >
                      {WEEK_DAYS.map((day) => (
                        <ToggleGroupItem
                          key={day.value}
                          value={String(day.value)}
                          className="w-full data-[state=on]:bg-primary data-[state=on]:text-white"
                        >
                          {day.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reminderTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder (optional)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="mt-2 flex space-x-3">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded-full cursor-pointer shadow-sm ${
                          selectedColor === color ? 'ring-2 ring-offset-2 ring-black' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="sm:justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={addHabitMutation.isPending}
              >
                Save Habit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
