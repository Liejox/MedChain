import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Key, UserPlus, Shield, Fingerprint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DIDLoginForm() {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [didIdentifier, setDidIdentifier] = useState("");
  
  // Registration form state
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    role: "",
    specialty: "",
    licenseNumber: ""
  });

  const handleDIDLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!didIdentifier.trim()) {
      toast({
        title: "Error",
        description: "Please enter your DID identifier",
        variant: "destructive"
      });
      return;
    }

    try {
      await login({ didIdentifier });
      toast({
        title: "Success",
        description: "DID authentication successful!",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message || "Invalid DID identifier",
        variant: "destructive"
      });
    }
  };

  const handleDIDRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, email, role, specialty, licenseNumber } = registrationData;
    
    if (!name || !email || !role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (role === 'doctor' && (!specialty || !licenseNumber)) {
      toast({
        title: "Error", 
        description: "Specialty and license number are required for doctors",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/did-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const result = await response.json();
      
      // Auto-login after registration
      localStorage.setItem('token', result.token);
      
      toast({
        title: "Registration Successful!",
        description: `Your DID has been created: ${result.didIdentifier}`,
        variant: "default"
      });
      
      // Trigger auth state update
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const sampleDIDs = [
    { did: "did:example:patientjohn456", role: "Patient", name: "John Doe" },
    { did: "did:example:doctorjane123", role: "Doctor", name: "Dr. Jane Smith" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              MedChain DID
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Secure Healthcare Identity with Decentralized Technology
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
              <Fingerprint className="h-3 w-3 mr-1" />
              W3C DID Standard
            </Badge>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
              <Shield className="h-3 w-3 mr-1" />
              Verifiable Credentials
            </Badge>
          </div>
        </div>

        <Card className="glassmorphism">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center">
                <Key className="h-4 w-4 mr-2" />
                DID Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center">
                <UserPlus className="h-4 w-4 mr-2" />
                Create DID
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2 text-blue-600" />
                  Authenticate with Your DID
                </CardTitle>
                <CardDescription>
                  Enter your Decentralized Identifier to securely access your healthcare profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleDIDLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="did">DID Identifier</Label>
                    <Input
                      id="did"
                      type="text"
                      placeholder="did:example:patient123"
                      value={didIdentifier}
                      onChange={(e) => setDidIdentifier(e.target.value)}
                      className="font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Example: did:example:patient123 or did:example:doctor456
                    </p>
                  </div>
                  
                  <Button type="submit" className="w-full btn-medical" disabled={isLoading}>
                    {isLoading ? "Authenticating..." : "Authenticate with DID"}
                  </Button>
                </form>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Demo DIDs (for testing):
                  </h4>
                  <div className="space-y-2">
                    {sampleDIDs.map((sample) => (
                      <div
                        key={sample.did}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDidIdentifier(sample.did)}
                      >
                        <div>
                          <p className="font-mono text-xs text-blue-600 dark:text-blue-400">
                            {sample.did}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sample.name} ({sample.role})
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-green-600" />
                  Create Your Healthcare DID
                </CardTitle>
                <CardDescription>
                  Register a new Decentralized Identity for secure healthcare management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDIDRegistration} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={registrationData.name}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registrationData.email}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={registrationData.role}
                      onValueChange={(value) => setRegistrationData(prev => ({ ...prev, role: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Healthcare Provider (Doctor)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {registrationData.role === 'doctor' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Medical Specialty *</Label>
                        <Input
                          id="specialty"
                          value={registrationData.specialty}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, specialty: e.target.value }))}
                          placeholder="e.g., Internal Medicine"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="license">License Number *</Label>
                        <Input
                          id="license"
                          value={registrationData.licenseNumber}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                          placeholder="e.g., MD123456"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      🔐 What happens when you register:
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• A unique DID (Decentralized Identifier) will be generated</li>
                      <li>• Cryptographic keys are created for secure authentication</li>
                      <li>• Your DID Document is stored following W3C standards</li>
                      <li>• You can immediately start issuing/receiving verifiable credentials</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full btn-medical" disabled={isLoading}>
                    {isLoading ? "Creating DID..." : "Create Healthcare DID"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Powered by W3C DID standards and Verifiable Credentials for secure healthcare identity management
          </p>
        </div>
      </div>
    </div>
  );
}