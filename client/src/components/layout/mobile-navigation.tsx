import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, ClipboardList, Calendar, BarChart, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import AddHabitDialog from "../habit/add-habit-dialog";

export default function MobileNavigation() {
  const [location] = useLocation();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const navigation = [
    { name: "Home", href: "/", icon: Home, current: location === "/" },
    { name: "Habits", href: "/habits", icon: ClipboardList, current: location === "/habits" },
    { name: "Add", href: "#", icon: Plus, current: false, action: true },
    { name: "Calendar", href: "/calendar", icon: Calendar, current: location === "/calendar" },
    { name: "Stats", href: "/statistics", icon: BarChart, current: location === "/statistics" },
  ];

  return (
    <>
      <div className="md:hidden bg-white fixed bottom-0 left-0 right-0 border-t border-gray-200 z-10">
        <div className="grid grid-cols-5 h-16">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.action ? (
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="flex flex-col items-center justify-center w-full h-full text-white bg-primary rounded-full h-14 w-14 mx-auto -mt-5 shadow-lg"
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs mt-0.5">{item.name}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center h-full",
                    item.current ? "text-primary" : "text-gray-600"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs mt-1">{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <AddHabitDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </>
  );
}
