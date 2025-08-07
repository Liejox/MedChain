import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Calendar, 
  Clock, 
  Award,
  Plus,
  Upload,
  Eye,
  Share,
  Download,
  Shield,
  FileText
} from "lucide-react";

export function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, appointmentsRes, documentsRes] = await Promise.all([
        fetch("/api/dashboard/stats", { headers }),
        fetch("/api/appointments", { headers }),
        fetch("/api/documents", { headers }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setTodayAppointments(appointmentsData.slice(0, 5));
      }

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json();
        setRecentDocuments(documentsData.slice(0, 5));
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
              Medical Dashboard
            </h1>
            <p className="mt-2 text-cool-gray dark:text-gray-400">
              Manage your patients and medical records securely
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-4">
            <Button className="btn-medical">
              <Plus className="mr-2 h-4 w-4" />
              Issue Credential
            </Button>
            <Button className="btn-healthcare">
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
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
                  Total Patients
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalPatients || 0}
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
                  Today's Appointments
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayAppointments.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-healthcare-green/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-healthcare-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism dark:glassmorphism-dark card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cool-gray dark:text-gray-400 text-sm font-medium">
                  Pending Reviews
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism dark:glassmorphism-dark card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cool-gray dark:text-gray-400 text-sm font-medium">
                  Credentials Issued
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.credentialsIssued || 0}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Patients */}
        <div className="lg:col-span-2">
          <Card className="glassmorphism dark:glassmorphism-dark">
            <CardHeader className="border-b border-white/20">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Patients</CardTitle>
                <Button variant="link" className="text-medical-blue">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentPatients.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No recent patients
                  </p>
                ) : (
                  recentPatients.map((patient, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-white/40 dark:bg-gray-800/40 rounded-lg hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {patient.name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {patient.name || 'Anonymous Patient'}
                          </h3>
                          <Badge className="status-verified">
                            <Shield className="mr-1 h-3 w-3" />
                            DID Verified
                          </Badge>
                        </div>
                        <p className="text-sm text-cool-gray dark:text-gray-400">
                          {patient.condition || 'General Consultation'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {patient.lastVisit || 'Recently'}
                        </p>
                        <p className="text-xs text-cool-gray dark:text-gray-400">
                          Last visit
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Content */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card className="glassmorphism dark:glassmorphism-dark">
            <CardHeader className="border-b border-white/20">
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {todayAppointments.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    No appointments today
                  </p>
                ) : (
                  todayAppointments.map((appointment, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-8 bg-medical-blue rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(appointment.scheduledAt).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-cool-gray dark:text-gray-400">
                          {appointment.type} - {appointment.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
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
                  <Award className="h-5 w-5 text-medical-blue" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Issue VC</p>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Create medical credential
                  </p>
                </div>
              </Button>

              <Button className="w-full justify-start" variant="ghost">
                <div className="w-10 h-10 bg-healthcare-green/10 rounded-lg flex items-center justify-center mr-3">
                  <Shield className="h-5 w-5 text-healthcare-green" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Verify VC</p>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Validate patient credential
                  </p>
                </div>
              </Button>

              <Button className="w-full justify-start" variant="ghost">
                <div className="w-10 h-10 bg-digital-purple/10 rounded-lg flex items-center justify-center mr-3">
                  <Upload className="h-5 w-5 text-digital-purple" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Upload Doc</p>
                  <p className="text-sm text-cool-gray dark:text-gray-400">
                    Add medical record
                  </p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="mt-8">
        <Card className="glassmorphism dark:glassmorphism-dark">
          <CardHeader className="border-b border-white/20">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Medical Documents</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" className="btn-medical">
                  <Upload className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button size="sm" className="btn-healthcare">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Document
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Patient
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No documents found
                      </td>
                    </tr>
                  ) : (
                    recentDocuments.map((document, index) => (
                      <tr
                        key={index}
                        className="hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                              <FileText className="h-4 w-4 text-red-600" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {document.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                          Patient
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary">{document.type}</Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                          {new Date(document.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className="status-verified">
                            <Shield className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Share className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
