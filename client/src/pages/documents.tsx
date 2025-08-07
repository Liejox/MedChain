import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentUpload } from "@/components/documents/document-upload";

export default function Documents() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <main className="flex-1 p-6">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Medical Documents
            </h1>
            <p className="mt-2 text-cool-gray dark:text-gray-400">
              Manage your medical records and documents
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Button 
              className="btn-medical"
              onClick={() => setShowUpload(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {showUpload ? (
        <div className="flex justify-center mb-8">
          <DocumentUpload 
            onClose={() => setShowUpload(false)}
            onSuccess={() => setShowUpload(false)}
          />
        </div>
      ) : null}

      <DocumentList />
    </main>
  );
}
