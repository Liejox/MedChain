import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface DocumentUploadProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function DocumentUpload({ onClose, onSuccess }: DocumentUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentData, setDocumentData] = useState({
    name: "",
    type: "",
    patientId: "",
    accessLevel: "private",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocumentData(prev => ({ ...prev, name: file.name }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", documentData.name);
      formData.append("type", documentData.type);
      formData.append("patientId", documentData.patientId || "");
      formData.append("accessLevel", documentData.accessLevel);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Document uploaded",
          description: "Your document has been uploaded successfully",
        });
        
        // Invalidate documents cache
        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
        
        onSuccess?.();
        onClose?.();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md glassmorphism dark:glassmorphism-dark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upload Medical Document</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <File className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Click to select a file or drag and drop
                  </p>
                </div>
              )}
              <Input
                id="file"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Label
                htmlFor="file"
                className="mt-4 inline-block cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                Choose File
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Document Name</Label>
            <Input
              id="name"
              value={documentData.name}
              onChange={(e) => setDocumentData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter document name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Document Type</Label>
            <Select
              value={documentData.type}
              onValueChange={(value) => setDocumentData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="lab-report">Lab Report</SelectItem>
                <SelectItem value="diagnosis">Diagnosis</SelectItem>
                <SelectItem value="image">Medical Image</SelectItem>
                <SelectItem value="discharge-summary">Discharge Summary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessLevel">Access Level</Label>
            <Select
              value={documentData.accessLevel}
              onValueChange={(value) => setDocumentData(prev => ({ ...prev, accessLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-4">
            {onClose && (
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1 btn-medical" disabled={isLoading || !selectedFile}>
              {isLoading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
