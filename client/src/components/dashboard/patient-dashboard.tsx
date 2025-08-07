import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  FileText, 
  Award,
  Plus,
  Shield,
  Activity,
  Clock
} from "lucide-react";
import { Link } from "wouter";

export function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [recentCredentials, setRecentCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, appointmentsRes, documentsRes, credentialsRes] = await Promise.all([
        fetch("/api/dashboard/stats", { headers }),
        fetch("/api/appointments", { headers }),
        fetch("/api/documents", { headers }),
        fetch("/api/credentials", { headers }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setRecentAppointments(appointmentsData.slice(0, 3));
      }

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json();
        setRecentDocuments(documentsData.slice(0, 3));
      }

      if (credentialsRes.ok) {
        const credentialsData = await credentialsRes.json();
        setRecentCredentials(credentialsData.slice(0, 3));
      }
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-2 text-cool-gray dark:text-gray-400">
              Your health dashboard and medical records
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-4">
            <Link href="/appointments">
              <Button className="btn-medical">
                <Plus className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </Link>
            <Link href="/documents">
              <Button className="btn-healthcare">
                <FileText className="mr-2 h-4 w-4" />
                View Records
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glassmorphism dark:glassmorphism-dark card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cool-gray dark:text-gray-400 text-sm font-medium">
                  Total Appointments
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalAppointments || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-medical-blue/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-medical-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism dark:glassmorphism-dark card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cool-gray dark:text-gray-400 text-sm font-medium">
                  Medical Documents
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalDocuments || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-healthcare-green/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-healthcare-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism dark:glassmorphism-dark card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cool-gray dark:text-gray-400 text-sm font-medium">
                  Credentials
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCredentials || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-digital-purple/10 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-digital-purple" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <Card className="glassmorphism dark:glassmorphism-dark">
          <CardHeader className="border-b border-white/20">
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Link href="/appointments">
                <Button variant="link" className="text-medical-blue">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <Link href="/appointments">
                    <Button className="mt-4 btn-medical">
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              ) : (
                recentAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-white/40 dark:bg-gray-800/40 rounded-lg"
                  >
                    <div className="w-2 h-12 bg-medical-blue rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {appointment.type || 'Consultation'}
                      </p>
                      <p className="text-sm text-cool-gray dark:text-gray-400">
                        {new Date(appointment.scheduledAt).toLocaleDateString()} at {new Date(appointment.scheduledAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className={appointment.status === 'scheduled' ? 'status-verified' : 'status-pending'}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="glassmorphism dark:glassmorphism-dark">
          <CardHeader className="border-b border-white/20">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Documents</CardTitle>
              <Link href="/documents">
                <Button variant="link" className="text-medical-blue">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No documents yet</p>
                </div>
              ) : (
                recentDocuments.map((document, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-white/40 dark:bg-gray-800/40 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {document.name}
                      </p>
                      <p className="text-sm text-cool-gray dark:text-gray-400">
                        {document.type} • {new Date(document.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="status-verified">
                      <Shield className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Overview */}
      <div className="mt-8">
        <Card className="glassmorphism dark:glassmorphism-dark">
          <CardHeader className="border-b border-white/20">
            <CardTitle>Health Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Overall Health
                </h3>
                <p className="text-sm text-cool-gray dark:text-gray-400">
                  Regular checkups recommended
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Verified Credentials
                </h3>
                <p className="text-sm text-cool-gray dark:text-gray-400">
                  {recentCredentials.length} active credentials
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Next Appointment
                </h3>
                <p className="text-sm text-cool-gray dark:text-gray-400">
                  {recentAppointments.length > 0 
                    ? new Date(recentAppointments[0].scheduledAt).toLocaleDateString()
                    : 'No appointments scheduled'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
