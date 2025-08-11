import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Key, 
  Copy, 
  Download, 
  ExternalLink, 
  CheckCircle,
  QrCode,
  Share,
  Eye,
  EyeOff,
  User,
  Calendar,
  MapPin,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DIDProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [didDocument, setDidDocument] = useState<any>(null);

  useEffect(() => {
    fetchDIDDocument();
  }, [user]);

  const fetchDIDDocument = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDidDocument(data.didDocument);
      }
    } catch (error) {
      console.error("Failed to fetch DID document:", error);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const downloadDIDDocument = () => {
    if (!didDocument) return;

    const blob = new Blob([JSON.stringify(didDocument, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `did-document-${user?.didIdentifier?.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "DID Document has been downloaded",
    });
  };

  const shareDID = () => {
    if (navigator.share && user?.didIdentifier) {
      navigator.share({
        title: 'My Healthcare DID',
        text: `My Decentralized Identity: ${user.didIdentifier}`,
        url: window.location.origin
      });
    } else {
      copyToClipboard(user?.didIdentifier || '', 'DID Identifier');
    }
  };

  if (!user) return null;

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            DID Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your Decentralized Identity and verification details
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20" data-testid="badge-verified">
          <Shield className="h-3 w-3 mr-1" />
          DID Verified
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DID Identity Card */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Identity Information
            </CardTitle>
            <CardDescription>
              Your verified healthcare identity details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Full Name</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-lg font-semibold" data-testid="text-fullname">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Username</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-mono" data-testid="text-username">{user.username}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Role</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Badge variant="secondary" className="capitalize" data-testid="badge-role">
                  {user.role}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Registration Date</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm" data-testid="text-created">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not available'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DID Identifier Card */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              DID Identifier
            </CardTitle>
            <CardDescription>
              Your unique decentralized identifier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">DID</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={user.didIdentifier}
                  readOnly
                  className="font-mono text-sm"
                  data-testid="input-did"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(user.didIdentifier, 'DID Identifier')}
                  data-testid="button-copy-did"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Verification Status</Label>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium" data-testid="text-verification">
                  Verified & Active
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">DID Method</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-mono text-sm" data-testid="text-method">example</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareDID}
                className="flex-1"
                data-testid="button-share-did"
              >
                <Share className="h-4 w-4 mr-2" />
                Share DID
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-qr-code">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>DID QR Code</DialogTitle>
                    <DialogDescription>
                      Scan to share your DID identifier
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-center p-8">
                    <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                    {user.didIdentifier}
                  </p>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* DID Document Card */}
        <Card className="glassmorphism lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2 text-purple-600" />
              DID Document
            </CardTitle>
            <CardDescription>
              Complete W3C DID Document with cryptographic keys and service endpoints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {didDocument && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Document ID</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="font-mono text-sm break-all" data-testid="text-doc-id">
                        {didDocument.id}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Context</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="font-mono text-sm" data-testid="text-context">
                        {didDocument['@context']?.join(', ') || 'W3C DID v1'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Public Key</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs break-all" data-testid="text-public-key">
                        {user.publicKey}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(user.publicKey, 'Public Key')}
                        data-testid="button-copy-pubkey"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Verification Methods ({didDocument.verificationMethod?.length || 0})
                  </Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {didDocument.verificationMethod?.map((method: any, index: number) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <div className="flex items-center space-x-2">
                          <Key className="h-3 w-3 text-blue-500" />
                          <span className="font-mono text-xs" data-testid={`text-method-${index}`}>
                            {method.id}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {method.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Service Endpoints</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {didDocument.service?.length > 0 ? (
                      didDocument.service.map((service: any, index: number) => (
                        <div key={index} className="mb-2 last:mb-0">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-3 w-3 text-green-500" />
                            <span className="font-medium text-sm">{service.type}</span>
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                              {service.serviceEndpoint}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500" data-testid="text-no-services">
                        No service endpoints configured
                      </span>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={downloadDIDDocument}
                    data-testid="button-download-doc"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Document
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" data-testid="button-view-raw">
                        <Eye className="h-4 w-4 mr-2" />
                        View Raw JSON
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>Complete DID Document</DialogTitle>
                        <DialogDescription>
                          Raw W3C DID Document in JSON format
                        </DialogDescription>
                      </DialogHeader>
                      <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto">
                        {JSON.stringify(didDocument, null, 2)}
                      </pre>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" data-testid="button-verify">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Document
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}