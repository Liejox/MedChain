import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  XCircle,
  User,
  Mail,
  Heart,
  TrendingUp,
  AlertCircle,
  Copy
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function PatientDIDDashboard() {
  const { user } = useAuth();
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!user
  });

  const { data: credentials = [] } = useQuery({
    queryKey: ['/api/credentials'],
    enabled: !!user
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  // Type-safe credentials array
  const credentialsArray = Array.isArray(credentials) ? credentials : [];

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

  // Group credentials by type for better organization
  const groupedCredentials = credentialsArray.reduce((groups: any, credential: any) => {
    const type = credential.credentialType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(credential);
    return groups;
  }, {});

  const recentCredentials = credentialsArray.slice(0, 3);
  const upcomingAppointments = credentialsArray.filter((cred: any) => 
    cred.credentialType === 'AppointmentCredential'
  ).slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-blue-100 dark:border-blue-800">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Your secure healthcare identity dashboard
                </p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800 px-4 py-2">
            <Shield className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-medium">DID Verified</span>
          </Badge>
        </div>

        {/* Profile Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* DID Profile Card */}
          <Card className="lg:col-span-2 glassmorphism border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Your Identity Profile
              </CardTitle>
              <CardDescription>
                Decentralized identity information and verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Full Name
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {(user as any)?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      DID Identifier
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="font-mono text-xs text-blue-700 dark:text-blue-300 break-all">
                          {user?.didIdentifier}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(user?.didIdentifier || '', 'DID')}
                        className="h-10 w-10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Verification Status
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Identity Verified</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/10">
                  <Eye className="h-4 w-4 mr-2" />
                  View DID Document
                </Button>
                <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 dark:hover:bg-green-900/10">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Share Identity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="glassmorphism border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Credentials</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{credentialsArray.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">Verified</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{credentialsArray.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Status</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">Healthy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Medical Records */}
          <Card className="glassmorphism border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
                Recent Medical Records
              </CardTitle>
              <CardDescription>
                Latest healthcare credentials and checkups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCredentials.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      No recent records
                    </h3>
                    <p className="text-xs text-gray-400">
                      Your medical records will appear here
                    </p>
                  </div>
                ) : (
                  recentCredentials.map((credential: any, index: number) => (
                    <div
                      key={credential.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-all hover:shadow-md ${
                        index % 2 === 0 
                          ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800' 
                          : 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${getCredentialColor(credential.credentialType)}`}>
                        {getCredentialIcon(credential.credentialType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {formatCredentialType(credential.credentialType)}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(credential.issuanceDate)}
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedCredential(credential)}
                            className="h-8 w-8 p-0"
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="font-medium">Issuer DID:</label>
                                <p className="font-mono text-xs text-blue-600 break-all mt-1">
                                  {credential.issuerDid}
                                </p>
                              </div>
                              <div>
                                <label className="font-medium">Subject DID:</label>
                                <p className="font-mono text-xs text-green-600 break-all mt-1">
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
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="glassmorphism border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Scheduled healthcare visits and consultations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      No upcoming appointments
                    </h3>
                    <p className="text-xs text-gray-400">
                      Schedule your next visit with a healthcare provider
                    </p>
                  </div>
                ) : (
                  upcomingAppointments.map((appointment: any, index: number) => (
                    <div
                      key={appointment.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        index % 2 === 0 
                          ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800' 
                          : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {appointment.vcData?.credentialSubject?.purpose || 'Consultation'}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {appointment.vcData?.credentialSubject?.doctorName || 'Healthcare Provider'}
                            </p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {appointment.vcData?.credentialSubject?.appointmentDate} at {appointment.vcData?.credentialSubject?.appointmentTime}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {appointment.vcData?.credentialSubject?.status || 'Scheduled'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Credentials Table */}
        <Card className="glassmorphism border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Complete Medical History
            </CardTitle>
            <CardDescription>
              All your verifiable healthcare credentials in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            {credentialsArray.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  No Medical Records Yet
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Your verifiable healthcare credentials will appear here once issued by healthcare providers. 
                  These digital credentials are secure, private, and under your complete control.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Issued By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {credentialsArray.map((credential: any, index: number) => (
                        <tr 
                          key={credential.id}
                          className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getCredentialColor(credential.credentialType)}`}>
                                {getCredentialIcon(credential.credentialType)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCredentialType(credential.credentialType)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                              {credential.issuerDid.length > 30 
                                ? `${credential.issuerDid.substring(0, 30)}...` 
                                : credential.issuerDid}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(credential.issuanceDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={credential.status === 'active' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {credential.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedCredential(credential)}
                                    className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  >
                                    <Eye className="h-4 w-4 text-blue-600" />
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
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <label className="font-medium">Issuer DID:</label>
                                        <p className="font-mono text-xs text-blue-600 break-all mt-1">
                                          {credential.issuerDid}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">Subject DID:</label>
                                        <p className="font-mono text-xs text-green-600 break-all mt-1">
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
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20"
                              >
                                <Download className="h-4 w-4 text-green-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}