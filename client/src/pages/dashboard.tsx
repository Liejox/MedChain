import { useAuth } from "@/hooks/use-auth";
import { PatientDashboard } from "@/components/dashboard/patient-dashboard";
import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "patient":
      return <PatientDashboard />;
    case "doctor":
      return <DoctorDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <div>Unknown role</div>;
  }
}
