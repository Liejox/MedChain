import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Moon, Sun, Shield } from "lucide-react";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "doctor":
        return "bg-medical-blue/10 text-medical-blue";
      case "patient":
        return "bg-healthcare-green/10 text-healthcare-green";
      case "admin":
        return "bg-digital-purple/10 text-digital-purple";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "doctor":
        return "Doctor Portal";
      case "patient":
        return "Patient Portal";
      case "admin":
        return "Admin Portal";
      default:
        return role;
    }
  };

  return (
    <nav className="glassmorphism dark:glassmorphism-dark shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 medical-gradient rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                MedChain
              </span>
            </div>

            <Badge className={`hidden md:flex items-center space-x-2 ${getRoleColor(user.role)}`}>
              <div className="w-2 h-2 bg-current rounded-full"></div>
              <span className="text-sm font-medium">
                {getRoleDisplayName(user.role)}
              </span>
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <NotificationCenter onClose={() => setShowNotifications(false)} />
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback>
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.firstName} {user.lastName}
                </span>
                {user.isVerified && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-healthcare-green rounded-full"></div>
                    <span className="text-xs text-healthcare-green">DID Verified</span>
                  </div>
                )}
              </div>
              <Button variant="ghost" onClick={logout} className="text-sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
