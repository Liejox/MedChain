import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CredentialList } from "@/components/credentials/credential-list";
import { CredentialForm } from "@/components/credentials/credential-form";

export default function Credentials() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="flex-1 p-6">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Verifiable Credentials
            </h1>
            <p className="mt-2 text-cool-gray dark:text-gray-400">
              {user?.role === "patient" 
                ? "View and manage your medical credentials"
                : "Issue and manage verifiable credentials"
              }
            </p>
          </div>
          {user?.role === "doctor" && (
            <div className="mt-4 lg:mt-0">
              <Button 
                className="btn-medical"
                onClick={() => setShowForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Issue Credential
              </Button>
            </div>
          )}
        </div>
      </div>

      {showForm && user?.role === "doctor" ? (
        <div className="flex justify-center mb-8">
          <CredentialForm 
            onClose={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      ) : null}

      <CredentialList />
    </main>
  );
}
