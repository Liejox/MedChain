import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  User,
  Search,
  Filter,
  Edit,
  X
} from "lucide-react";
import { format } from "date-fns";

export function AppointmentList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      scheduled: "status-verified",
      completed: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      cancelled: "status-error",
    };
    return colors[status] || "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      consultation: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      "follow-up": "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      surgery: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      checkup: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    };
    return colors[type] || "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        toast({
          title: "Appointment cancelled",
          description: "The appointment has been cancelled successfully",
        });
        fetchAppointments();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  const isUpcoming = (scheduledAt: string) => {
    return new Date(scheduledAt) > new Date();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card className="glassmorphism dark:glassmorphism-dark">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No appointments found
            </h3>
            <p className="text-cool-gray dark:text-gray-400">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "You don't have any appointments scheduled"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="glassmorphism dark:glassmorphism-dark card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-medical-blue/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-medical-blue" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {appointment.type}
                        </h3>
                        <Badge className={getTypeColor(appointment.type)}>
                          {appointment.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-cool-gray dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(appointment.scheduledAt), "PPP")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(appointment.scheduledAt), "p")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{appointment.duration} min</span>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-cool-gray dark:text-gray-400 mt-2">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    
                    {appointment.status === "scheduled" && isUpcoming(appointment.scheduledAt) && (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
