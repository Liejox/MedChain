import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";

interface AppointmentFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function AppointmentForm({ onClose, onSuccess }: AppointmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [appointmentData, setAppointmentData] = useState({
    doctorId: "",
    patientId: "",
    type: "consultation",
    duration: 30,
    notes: "",
    time: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/doctors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !appointmentData.time || !appointmentData.doctorId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const [hours, minutes] = appointmentData.time.split(':');
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...appointmentData,
          scheduledAt: scheduledAt.toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Appointment scheduled",
          description: "Your appointment has been scheduled successfully",
        });
        
        // Invalidate appointments cache
        queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
        
        onSuccess?.();
        onClose?.();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to schedule appointment");
      }
    } catch (error: any) {
      toast({
        title: "Scheduling failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  return (
    <Card className="w-full max-w-lg glassmorphism dark:glassmorphism-dark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Schedule Appointment</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {user?.role === "patient" && (
            <div className="space-y-2">
              <Label htmlFor="doctorId">Select Doctor</Label>
              <Select
                value={appointmentData.doctorId}
                onValueChange={(value) => setAppointmentData(prev => ({ ...prev, doctorId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.user?.firstName} {doctor.user?.lastName} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {user?.role === "doctor" && (
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={appointmentData.patientId}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, patientId: e.target.value }))}
                placeholder="Enter patient ID"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Appointment Type</Label>
            <Select
              value={appointmentData.type}
              onValueChange={(value) => setAppointmentData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="checkup">Checkup</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Select
              value={appointmentData.time}
              onValueChange={(value) => setAppointmentData(prev => ({ ...prev, time: value }))}
            >
              <SelectTrigger>
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select
              value={appointmentData.duration.toString()}
              onValueChange={(value) => setAppointmentData(prev => ({ ...prev, duration: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={appointmentData.notes}
              onChange={(e) => setAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes..."
              className="h-20"
            />
          </div>

          <div className="flex space-x-4">
            {onClose && (
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1 btn-medical" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
