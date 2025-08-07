import { useState } from "react";
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
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";

interface CredentialFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function CredentialForm({ onClose, onSuccess }: CredentialFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date>();
  const [credentialData, setCredentialData] = useState({
    holderId: "",
    type: "",
    title: "",
    description: "",
    credentialData: {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialData.holderId || !credentialData.type || !credentialData.title) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...credentialData,
          expiresAt: expirationDate?.toISOString(),
          credentialData: {
            title: credentialData.title,
            description: credentialData.description,
            issuedBy: user?.firstName + " " + user?.lastName,
            issuedAt: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        toast({
          title: "Credential issued",
          description: "The verifiable credential has been issued successfully",
        });
        
        // Invalidate credentials cache
        queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
        
        onSuccess?.();
        onClose?.();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to issue credential");
      }
    } catch (error: any) {
      toast({
        title: "Issue failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg glassmorphism dark:glassmorphism-dark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Issue Verifiable Credential</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holderId">Patient DID</Label>
            <Input
              id="holderId"
              value={credentialData.holderId}
              onChange={(e) => setCredentialData(prev => ({ ...prev, holderId: e.target.value }))}
              placeholder="did:example:123... or patient ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Credential Type</Label>
            <Select
              value={credentialData.type}
              onValueChange={(value) => setCredentialData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select credential type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vaccination">Vaccination Certificate</SelectItem>
                <SelectItem value="diagnosis">Medical Diagnosis</SelectItem>
                <SelectItem value="surgery">Surgery Record</SelectItem>
                <SelectItem value="lab-result">Lab Results</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="fitness">Fitness Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={credentialData.title}
              onChange={(e) => setCredentialData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., COVID-19 Vaccination"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Medical Details</Label>
            <Textarea
              id="description"
              value={credentialData.description}
              onChange={(e) => setCredentialData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter medical details..."
              className="h-24"
            />
          </div>

          <div className="space-y-2">
            <Label>Expiration Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expirationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expirationDate ? format(expirationDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expirationDate}
                  onSelect={setExpirationDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex space-x-4">
            {onClose && (
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1 btn-medical" disabled={isLoading}>
              {isLoading ? "Issuing..." : "Issue Credential"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
