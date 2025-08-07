import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  FileText, 
  Calendar, 
  Activity, 
  Eye,
  Download,
  ExternalLink,
  Stethoscope,
  TestTube,
  Syringe,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function PatientDIDDashboard() {
  const { user } = useAuth();
  const [selectedCredential, setSelectedCredential] = useState<any>(null);

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!user
  });

  const { data: credentials = [] } = useQuery({
    queryKey: ['/api/credentials'],
    enabled: !!user
  });

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case 'HealthCheckupCredential':
        return <Stethoscope className="h-5 w-5" />;
      case 'BloodTestCredential':
        return <TestTube className="h-5 w-5" />;
      case 'VaccinationCredential':
        return <Syringe className="h-5 w-5" />;
      case 'AppointmentCredential':
        return <Calendar className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCredentialColor = (type: string) => {
    switch (type) {
      case 'HealthCheckupCredential':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'BloodTestCredential':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'VaccinationCredential':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'AppointmentCredential':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatCredentialType = (type: string) => {
    return type.replace('Credential', '').replace(/([A-Z])/g, ' $1').trim();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Patient Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your healthcare credentials and DID profile
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
          <Shield className="h-3 w-3 mr-1" />
          DID Verified
        </Badge>
      </div>

      {/* DID Profile Card */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Your Decentralized Identity
          </CardTitle>
          <CardDescription>
            Your unique healthcare DID and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                DID Identifier
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
                <span className="text-sm text-green-600">Verified</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <p className="text-lg">{user?.firstName} {user?.lastName}</p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View DID Document
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Share DID
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Verifiable Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats?.totalCredentials || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Healthcare credentials received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Verified Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats?.verifiedCredentials || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Verified and valid credentials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              DID Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">Active</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Identity status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Verifiable Credentials */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-600" />
            Your Verifiable Credentials
          </CardTitle>
          <CardDescription>
            Healthcare credentials issued by verified medical professionals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Credentials Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your verifiable healthcare credentials will appear here once issued by healthcare providers.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {credentials.map((credential: any) => (
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
                            {formatCredentialType(credential.credentialType)}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Issued by: <span className="font-mono text-xs">{credential.issuerDid}</span>
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Issued: {formatDate(credential.issuanceDate)}</span>
                            {credential.expirationDate && (
                              <span>Expires: {formatDate(credential.expirationDate)}</span>
                            )}
                            <Badge 
                              variant={credential.status === 'active' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {credential.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedCredential(credential)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center">
                                {getCredentialIcon(credential.credentialType)}
                                <span className="ml-2">{formatCredentialType(credential.credentialType)}</span>
                              </DialogTitle>
                              <DialogDescription>
                                Complete W3C Verifiable Credential details
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <label className="font-medium">Issuer DID:</label>
                                  <p className="font-mono text-xs text-blue-600 break-all">
                                    {credential.issuerDid}
                                  </p>
                                </div>
                                <div>
                                  <label className="font-medium">Subject DID:</label>
                                  <p className="font-mono text-xs text-green-600 break-all">
                                    {credential.subjectDid}
                                  </p>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <label className="font-medium text-sm">Credential Data:</label>
                                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto">
                                  {JSON.stringify(credential.vcData, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}