import { useAuth } from "@/hooks/use-auth";
import { PatientDIDDashboard } from "@/components/dashboard/patient-did-dashboard";
import { DoctorDIDDashboard } from "@/components/dashboard/doctor-did-dashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "patient":
      return <PatientDIDDashboard />;
    case "doctor":
      return <DoctorDIDDashboard />;
    default:
      return <div>Role not supported in DID mode</div>;
  }
}
