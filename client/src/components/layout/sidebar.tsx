import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Award, 
  Calendar,
  Settings,
  Shield,
  UserCheck,
  Building2
} from "lucide-react";
import { Link, useLocation } from "wouter";

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getMenuItems = () => {
    const baseItems = [
      { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
    ];

    if (user.role === "patient") {
      return [
        ...baseItems,
        { href: "/appointments", icon: Calendar, label: "Appointments" },
        { href: "/documents", icon: FileText, label: "My Documents" },
        { href: "/credentials", icon: Award, label: "My Credentials" },
        { href: "/settings", icon: Settings, label: "Settings" },
      ];
    } else if (user.role === "doctor") {
      return [
        ...baseItems,
        { href: "/patients", icon: Users, label: "My Patients" },
        { href: "/appointments", icon: Calendar, label: "Appointments" },
        { href: "/documents", icon: FileText, label: "Documents" },
        { href: "/credentials", icon: Award, label: "Credentials" },
        { href: "/settings", icon: Settings, label: "Settings" },
      ];
    } else if (user.role === "admin") {
      return [
        ...baseItems,
        { href: "/users", icon: Users, label: "User Management" },
        { href: "/doctors", icon: UserCheck, label: "Doctor Approvals" },
        { href: "/hospitals", icon: Building2, label: "Hospital Management" },
        { href: "/settings", icon: Settings, label: "Settings" },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 min-h-screen glassmorphism dark:glassmorphism-dark shadow-lg border-r border-white/20 hidden lg:block">
      <div className="p-6">
        {/* DID Profile Card */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 mb-6 shadow-lg">
          <div className="text-center">
            <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-medical-blue">
              <AvatarImage src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-lg">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-cool-gray dark:text-gray-400 capitalize">
              {user.role}
            </p>
            {user.isVerified && (
              <div className="mt-2 flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-healthcare-green rounded-full"></div>
                <span className="text-xs text-healthcare-green">DID Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-4 py-2 rounded-lg font-medium transition-colors",
                    isActive
                      ? "text-medical-blue bg-medical-blue/10"
                      : "text-gray-600 dark:text-gray-300 hover:text-medical-blue hover:bg-medical-blue/10"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
