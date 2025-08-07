import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  Building2, 
  Activity,
  TrendingUp,
  Shield,
  AlertTriangle
} from "lucide-react";

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const statsRes = await fetch("/api/dashboard/stats", { headers });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Mock recent activity for admin
      setRecentActivity([
        {
          id: 1,
          type: "doctor_approval",
          message: "New doctor registration pending approval",
          timestamp: new Date().toISOString(),
          status: "pending"
        },
        {
          id: 2,
          type: "credential_issued",
          message: "Medical credential issued to patient",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: "success"
        },
        {
          id: 3,
          type: "system_alert",
          message: "High system load detected",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: "warning"
        }
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-cool-gray dark:text-gray-400">
              Manage users, doctors, and system overview
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-4">
            <Button className="btn-medical">
              <UserCheck className="mr-2 h-4 w-4" />
              Approve Doctors
            </Button>
            <Button className="btn-healthcare">
              <Building2 className="mr-2 h-4 w-4" />
              Manage Hospitals
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glassmorphism dark:glassmorphism-dark card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cool-gray dark:text-gray-400 text-sm font-medium">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-medical-blue/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-medical-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism dark:glassmorphism-dark card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cool-gray dark:text-gray-400 text-sm font-medium">
                  Verified Doctors
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalDoctors || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-healthcare-green/10 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-healthcare-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism dark:glassmorphism-dark card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cool-gray dark:text-gray-400 text-sm font-medium">
                  Active Patients
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalPatients || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-digital-purple/10 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-digital-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism dark:glassmorphism-dark card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cool-gray dark:text-gray-400 text-sm font-medium">
                  System Health
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  98.5%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="glassmorphism dark:glassmorphism-dark">
            <CardHeader className="border-b border-white/20">
              <CardTitle>Recent System Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-4 bg-white/40 dark:bg-gray-800/40 rounded-lg"
                  >
                    <div className={`w-2 h-12 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' :
                      activity.status === 'pending' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-sm text-cool-gray dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={
                      activity.status === 'success' ? 'status-verified' :
                      activity.status === 'warning' ? 'status-pending' :
                      'status-error'
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <div className="space-y-6">
          <Card className="glassmorphism dark:glassmorphism-dark">
            <CardHeader className="border-b border-white/20">
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  DID Verifications
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  1,247
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Active Sessions
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  342
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Documents Processed
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  8,921
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Credentials Issued
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  2,156
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glassmorphism dark:glassmorphism-dark">
            <CardHeader className="border-b border-white/20">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button className="w-full justify-start" variant="ghost">
                <div className="w-10 h-10 bg-medical-blue/10 rounded-lg flex items-center justify-center mr-3">
                  <UserCheck className="h-5 w-5 text-medical-blue" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Approve Doctors</p>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Review pending applications
                  </p>
                </div>
              </Button>

              <Button className="w-full justify-start" variant="ghost">
                <div className="w-10 h-10 bg-healthcare-green/10 rounded-lg flex items-center justify-center mr-3">
                  <Shield className="h-5 w-5 text-healthcare-green" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Security Audit</p>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Review system security
                  </p>
                </div>
              </Button>

              <Button className="w-full justify-start" variant="ghost">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">System Alerts</p>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Review active alerts
                  </p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
