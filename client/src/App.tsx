import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Dashboard from "@/pages/dashboard";
import Habits from "@/pages/habits";
import Calendar from "@/pages/calendar";
import Statistics from "@/pages/statistics";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      <Sidebar />
      <main className="flex-1 md:ml-64 pt-5 pb-20 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <MobileNavigation />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <MainLayout>
          <Dashboard />
        </MainLayout>
      )} />
      <Route path="/habits" component={() => (
        <MainLayout>
          <Habits />
        </MainLayout>
      )} />
      <Route path="/calendar" component={() => (
        <MainLayout>
          <Calendar />
        </MainLayout>
      )} />
      <Route path="/statistics" component={() => (
        <MainLayout>
          <Statistics />
        </MainLayout>
      )} />
      <Route path="/settings" component={() => (
        <MainLayout>
          <Settings />
        </MainLayout>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
