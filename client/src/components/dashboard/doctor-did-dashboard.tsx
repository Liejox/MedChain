import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  FileText, 
  Plus, 
  Activity, 
  Users,
  Stethoscope,
  TestTube,
  Syringe,
  Calendar,
  Send,
  Eye,
  CheckCircle,
  Clock
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function DoctorDIDDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueForm, setIssueForm] = useState({
    patientDid: '',
    credentialType: '',
    customData: ''
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!user
  });

  const { data: issuedCredentials = [] } = useQuery({
    queryKey: ['/api/credentials'],
    enabled: !!user
  });

  const credentialTypes = [
    { value: 'HealthCheckupCredential', label: 'Health Checkup', icon: <Stethoscope className="h-4 w-4" />, color: 'blue' },
    { value: 'BloodTestCredential', label: 'Blood Test Report', icon: <TestTube className="h-4 w-4" />, color: 'red' },
    { value: 'VaccinationCredential', label: 'Vaccination Record', icon: <Syringe className="h-4 w-4" />, color: 'green' },
    { value: 'AppointmentCredential', label: 'Appointment Confirmation', icon: <Calendar className="h-4 w-4" />, color: 'purple' }
  ];

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueForm.patientDid || !issueForm.credentialType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsIssuing(true);
    
    try {
      const payload: any = {
        patientDid: issueForm.patientDid,
        credentialType: issueForm.credentialType
      };

      if (issueForm.customData.trim()) {
        try {
          payload.customData = JSON.parse(issueForm.customData);
        } catch {
          toast({
            title: "Invalid JSON",
            description: "Custom data must be valid JSON format",
            variant: "destructive"
          });
          return;
        }
      }

      await apiRequest('/api/credentials/issue', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      toast({
        title: "Credential Issued Successfully",
        description: `${issueForm.credentialType.replace('Credential', '')} credential has been issued to the patient`,
        variant: "default"
      });

      // Reset form
      setIssueForm({
        patientDid: '',
        credentialType: '',
        customData: ''
      });

      // Refresh credentials list
      queryClient.invalidateQueries({ queryKey: ['/api/credentials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });

    } catch (error: any) {
      toast({
        title: "Failed to Issue Credential",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsIssuing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCredentialIcon = (type: string) => {
    const typeMap = credentialTypes.find(t => t.value === type);
    return typeMap?.icon || <FileText className="h-4 w-4" />;
  };

  const getCredentialColor = (type: string) => {
    const typeMap = credentialTypes.find(t => t.value === type);
    const color = typeMap?.color || 'gray';
    return `bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-300`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Doctor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Issue and manage verifiable healthcare credentials
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
          <Shield className="h-3 w-3 mr-1" />
          Licensed Provider
        </Badge>
      </div>

      {/* Doctor DID Profile */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Healthcare Provider Identity
          </CardTitle>
          <CardDescription>
            Your verified DID for issuing healthcare credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Provider DID
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                {user?.didIdentifier}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Verification Status
              </label>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Licensed & Verified</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Provider Name
            </label>
            <p className="text-lg">Dr. {user?.firstName} {user?.lastName}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Credentials Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats?.credentialsIssued || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total verifiable credentials issued
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Patients Served
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats?.totalPatients || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unique patients with credentials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Provider Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">Active</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Licensed to issue credentials
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issue Credential Form */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-green-600" />
            Issue New Verifiable Credential
          </CardTitle>
          <CardDescription>
            Create and issue healthcare credentials to patients using their DID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIssueCredential} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientDid">Patient DID *</Label>
                <Input
                  id="patientDid"
                  placeholder="did:example:patient123"
                  value={issueForm.patientDid}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, patientDid: e.target.value }))}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500">
                  Enter the patient's Decentralized Identifier
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="credentialType">Credential Type *</Label>
                <Select
                  value={issueForm.credentialType}
                  onValueChange={(value) => setIssueForm(prev => ({ ...prev, credentialType: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select credential type" />
                  </SelectTrigger>
                  <SelectContent>
                    {credentialTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          {type.icon}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customData">Custom Medical Data (Optional)</Label>
              <Textarea
                id="customData"
                placeholder='{"diagnosis": "Healthy", "notes": "Regular checkup completed"}'
                value={issueForm.customData}
                onChange={(e) => setIssueForm(prev => ({ ...prev, customData: e.target.value }))}
                className="font-mono text-sm"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                JSON format for custom medical data. Leave empty to use sample data.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="btn-medical" disabled={isIssuing}>
                {isIssuing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Issuing Credential...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Issue Credential
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIssueForm({ patientDid: '', credentialType: '', customData: '' })}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Issued Credentials */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Recently Issued Credentials
          </CardTitle>
          <CardDescription>
            Track credentials you've issued to patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {issuedCredentials.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Credentials Issued Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start issuing verifiable credentials to your patients using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-auto">
              {issuedCredentials.slice(0, 10).map((credential: any) => (
                <div
                  key={credential.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getCredentialColor(credential.credentialType)}`}>
                        {getCredentialIcon(credential.credentialType)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {credential.credentialType.replace('Credential', '').replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Patient: <span className="font-mono text-xs">{credential.subjectDid}</span>
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Issued: {formatDate(credential.issuanceDate)}</span>
                          <Badge 
                            variant={credential.status === 'active' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {credential.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>Issued Credential Details</DialogTitle>
                          <DialogDescription>
                            Complete W3C Verifiable Credential information
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <label className="font-medium">Credential ID:</label>
                              <p className="font-mono text-xs">{credential.id}</p>
                            </div>
                            <div>
                              <label className="font-medium">Status:</label>
                              <Badge className="ml-2">{credential.status}</Badge>
                            </div>
                          </div>
                          
                          <div>
                            <label className="font-medium text-sm">Full Credential Data:</label>
                            <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto">
                              {JSON.stringify(credential.vcData, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}