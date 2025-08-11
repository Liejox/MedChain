import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Key, Plus, Wallet, QrCode, ArrowRight, Fingerprint, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DIDLoginFormProps {
  onSwitchToGoogle: () => void;
}

export function DIDLoginForm({ onSwitchToGoogle }: DIDLoginFormProps) {
  const [didIdentifier, setDidIdentifier] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [newDidData, setNewDidData] = useState<any>(null);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleDIDLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!didIdentifier.trim()) {
      toast({
        title: "Error",
        description: "Please enter your DID identifier",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/did-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ didIdentifier: didIdentifier.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        await login(data.user);
        toast({
          title: "DID Authentication Successful",
          description: `Welcome back, ${data.user.firstName}!`,
        });
      } else {
        toast({
          title: "Authentication Failed",
          description: data.error || "Invalid DID or authentication failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to authentication service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    // Simulate wallet connection for demo
    toast({
      title: "Wallet Connection",
      description: "DID wallet connection simulated for demo. Use the form below to authenticate.",
    });
  };

  const generateNewDID = async () => {
    setIsLoading(true);
    
    try {
      // Generate a new DID for demo purposes
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 15);
      const newDID = `did:example:${timestamp}${randomSuffix}`;
      
      // Simulate DID document generation
      const didDocument = {
        "@context": ["https://www.w3.org/ns/did/v1"],
        "id": newDID,
        "verificationMethod": [{
          "id": `${newDID}#key-1`,
          "type": "Ed25519VerificationKey2020",
          "controller": newDID,
          "publicKeyMultibase": `z${Math.random().toString(36).substring(2, 50)}`
        }],
        "authentication": [`${newDID}#key-1`],
        "assertionMethod": [`${newDID}#key-1`]
      };

      const mockPrivateKey = `0x${Math.random().toString(16).substring(2, 66)}`;
      
      setNewDidData({
        did: newDID,
        privateKey: mockPrivateKey,
        didDocument
      });
      
      setShowGenerateDialog(true);
      
      toast({
        title: "New DID Generated",
        description: "Your new decentralized identity has been created!",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate new DID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const useGeneratedDID = () => {
    if (newDidData) {
      setDidIdentifier(newDidData.did);
      setPrivateKey(newDidData.privateKey);
      setShowGenerateDialog(false);
      toast({
        title: "DID Ready",
        description: "Generated DID has been loaded. You can now authenticate.",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const downloadDIDInfo = () => {
    if (!newDidData) return;
    
    const didInfo = {
      did: newDidData.did,
      privateKey: newDidData.privateKey,
      didDocument: newDidData.didDocument,
      generated: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(didInfo, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `did-identity-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "DID Information Downloaded",
      description: "Save this file securely - it contains your private key!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center">
          <Shield className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            DID Authentication
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Secure login with your Decentralized Identity
        </p>
      </div>

      {/* Demo Account Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <div className="text-center text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">Demo Account - John Doe</p>
            <p className="text-xs mt-1">DID: <span className="font-mono">did:example:patient123</span></p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Copy this DID to test login</p>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Connect Option */}
      <Card className="glassmorphism">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <Wallet className="h-5 w-5 mr-2 text-purple-600" />
            Connect DID Wallet
          </CardTitle>
          <CardDescription>
            Connect your existing DID wallet for seamless authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleWalletConnect}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            data-testid="button-connect-wallet"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect DID Wallet
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center">
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        <span className="px-4 text-sm text-gray-500 dark:text-gray-400">or</span>
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
      </div>

      {/* Manual DID Entry */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2 text-green-600" />
            Enter DID Manually
          </CardTitle>
          <CardDescription>
            Enter your DID identifier to authenticate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDIDLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="did">DID Identifier</Label>
              <Input
                id="did"
                type="text"
                placeholder="did:example:patient123"
                value={didIdentifier}
                onChange={(e) => setDidIdentifier(e.target.value)}
                className="font-mono"
                data-testid="input-did"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privateKey">Private Key (Optional)</Label>
              <div className="relative">
                <Input
                  id="privateKey"
                  type={showPrivateKey ? "text" : "password"}
                  placeholder="0x..."
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="font-mono pr-10"
                  data-testid="input-private-key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  data-testid="button-toggle-key"
                >
                  {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Private key enhances security but is optional for demo
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              disabled={isLoading}
              data-testid="button-did-login"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Authenticate with DID
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generate New DID */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-orange-600" />
            New to DID?
          </CardTitle>
          <CardDescription>
            Generate a new decentralized identity for healthcare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={generateNewDID}
            variant="outline"
            className="w-full border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/10"
            disabled={isLoading}
            data-testid="button-generate-did"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
            ) : (
              <Fingerprint className="h-4 w-4 mr-2" />
            )}
            Generate New DID
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center">
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        <span className="px-4 text-sm text-gray-500 dark:text-gray-400">fallback option</span>
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
      </div>

      {/* Google OAuth Fallback */}
      <Button
        onClick={onSwitchToGoogle}
        variant="outline"
        className="w-full border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10"
        data-testid="button-google-fallback"
      >
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>

      {/* Generate DID Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              New DID Generated Successfully
            </DialogTitle>
            <DialogDescription>
              Your new decentralized identity has been created. Save this information securely.
            </DialogDescription>
          </DialogHeader>
          
          {newDidData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>DID Identifier</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newDidData.did}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newDidData.did, "DID")}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Private Key</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newDidData.privateKey}
                    readOnly
                    type="password"
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newDidData.privateKey, "Private Key")}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400">
                  ⚠️ Keep your private key secure and never share it!
                </p>
              </div>

              <div className="flex space-x-2">
                <Button onClick={downloadDIDInfo} variant="outline" className="flex-1">
                  Download DID Info
                </Button>
                <Button onClick={useGeneratedDID} className="flex-1">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Use This DID
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}