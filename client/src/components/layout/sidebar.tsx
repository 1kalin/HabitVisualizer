import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  ClipboardList, 
  Calendar as CalendarIcon, 
  BarChart, 
  Settings as SettingsIcon,
  BellRing
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home, current: location === "/" },
    { name: "My Habits", href: "/habits", icon: ClipboardList, current: location === "/habits" },
    { name: "Calendar", href: "/calendar", icon: CalendarIcon, current: location === "/calendar" },
    { name: "Statistics", href: "/statistics", icon: BarChart, current: location === "/statistics" },
    { name: "Settings", href: "/settings", icon: SettingsIcon, current: location === "/settings" },
  ];

  return (
    <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 bg-white border-r border-gray-200 p-4">
      <div className="flex items-center justify-center p-2 mb-6">
        <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 className="text-xl font-bold ml-2 text-gray-800">HabitFlow</h1>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-md",
              item.current 
                ? "bg-primary-50 text-primary"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto">
        <div className="px-4 py-2">
          <div className="bg-gray-100 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reminders</h3>
            <div className="mt-2 text-sm text-gray-700">
              <div className="flex items-center">
                <BellRing className="h-4 w-4 mr-1 text-gray-500" />
                <p>Daily notifications activated</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">8:00 AM, 8:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
