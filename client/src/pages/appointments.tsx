import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { AppointmentForm } from "@/components/appointments/appointment-form";

export default function Appointments() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="flex-1 p-6">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Appointments
            </h1>
            <p className="mt-2 text-cool-gray dark:text-gray-400">
              Schedule and manage your medical appointments
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Button 
              className="btn-medical"
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </div>
        </div>
      </div>

      {showForm ? (
        <div className="flex justify-center mb-8">
          <AppointmentForm 
            onClose={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      ) : null}

      <AppointmentList />
    </main>
  );
}
