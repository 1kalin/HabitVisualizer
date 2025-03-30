import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BellRing, TrashIcon, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const settingsFormSchema = z.object({
  notifications: z.boolean(),
  morningReminder: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in 24-hour format (HH:MM)",
  }).optional().or(z.literal("")),
  eveningReminder: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in 24-hour format (HH:MM)",
  }).optional().or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function Settings() {
  const [isReset, setIsReset] = useState(false);
  const { toast } = useToast();
  
  // Default values for the form
  const defaultValues: SettingsFormValues = {
    notifications: true,
    morningReminder: "08:00",
    eveningReminder: "20:00",
  };
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });
  
  const saveSettingsMutation = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      const response = await apiRequest("POST", "/api/settings", values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const resetHabitsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/habits/reset", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Data reset",
        description: "All your habits and tracking data have been reset.",
      });
      
      setIsReset(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset data. Please try again.",
        variant: "destructive",
      });
      
      setIsReset(false);
    },
  });

  function onSubmit(data: SettingsFormValues) {
    saveSettingsMutation.mutate(data);
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Daily Reminders</FormLabel>
                        <FormDescription>
                          Receive notifications to complete your habits
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch("notifications") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="morningReminder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Morning Reminder</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <BellRing className="mr-2 h-4 w-4 text-gray-400" />
                              <Input type="time" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="eveningReminder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evening Reminder</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <BellRing className="mr-2 h-4 w-4 text-gray-400" />
                              <Input type="time" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="mt-4"
                  disabled={saveSettingsMutation.isPending}
                >
                  Save Settings
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Export Data</FormLabel>
                  <FormDescription>
                    Download all your habit tracking data as a CSV file
                  </FormDescription>
                </div>
                <Button variant="outline">
                  Export
                </Button>
              </div>
              
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-red-600">Reset Data</FormLabel>
                  <FormDescription>
                    Delete all your habits and tracking history. This cannot be undone.
                  </FormDescription>
                </div>
                <AlertDialog open={isReset} onOpenChange={setIsReset}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your habits 
                        and tracking history from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => resetHabitsMutation.mutate()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {resetHabitsMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          "Delete All Data"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
