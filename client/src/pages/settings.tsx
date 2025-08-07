import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/ui/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Shield, 
  Bell, 
  Moon, 
  Sun,
  Lock,
  Eye,
  Save
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    documentUpdates: true,
  });

  const handleSaveProfile = async () => {
    try {
      // In a real app, this would make an API call to update user profile
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-cool-gray dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Profile Settings */}
        <Card className="glassmorphism dark:glassmorphism-dark">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback className="text-lg">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-cool-gray dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
                {user?.isVerified && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Shield className="h-3 w-3 text-healthcare-green" />
                    <span className="text-xs text-healthcare-green">DID Verified</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="btn-medical">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="glassmorphism dark:glassmorphism-dark">
          <CardHeader>
            <div className="flex items-center space-x-2">
              {theme === "light" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Theme
                </h4>
                <p className="text-sm text-cool-gray dark:text-gray-400">
                  Choose your preferred theme
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glassmorphism dark:glassmorphism-dark">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </h4>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Appointment Reminders
                  </h4>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Get reminders for upcoming appointments
                  </p>
                </div>
                <Switch
                  checked={notifications.appointmentReminders}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, appointmentReminders: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Document Updates
                  </h4>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Get notified when documents are shared with you
                  </p>
                </div>
                <Switch
                  checked={notifications.documentUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, documentUpdates: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="glassmorphism dark:glassmorphism-dark">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    DID Verification
                  </h4>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Your decentralized identity status
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {user?.isVerified ? (
                    <>
                      <Shield className="h-4 w-4 text-healthcare-green" />
                      <span className="text-sm text-healthcare-green">Verified</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Not Verified</span>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Change Password
                  </h4>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Update your account password
                  </p>
                </div>
                <Button variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Activity Log
                  </h4>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    View your account activity
                  </p>
                </div>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Activity
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="glassmorphism dark:glassmorphism-dark border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Sign Out
                </h4>
                <p className="text-sm text-cool-gray dark:text-gray-400">
                  Sign out of your account
                </p>
              </div>
              <Button variant="destructive" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
