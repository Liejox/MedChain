import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, QrCode, Wallet, X } from "lucide-react";

interface DIDAuthModalProps {
  onClose: () => void;
}

export function DIDAuthModal({ onClose }: DIDAuthModalProps) {
  const { didLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [didIdentifier, setDidIdentifier] = useState("");

  const handleDIDLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await didLogin(didIdentifier);
      onClose();
    } catch (error) {
      // Error is handled in the auth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      // Use a demo DID for testing
      await didLogin("demo@patient.did");
      onClose();
    } catch (error) {
      // Error is handled in the auth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glassmorphism dark:glassmorphism-dark shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 medical-gradient rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <CardTitle>DID Authentication</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-cool-gray dark:text-gray-400 mb-6">
              Scan QR code with your DID wallet or connect directly
            </p>
            
            {/* QR Code Placeholder */}
            <div className="w-48 h-48 bg-white dark:bg-gray-800 rounded-xl mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <QrCode className="h-12 w-12 text-gray-400 mb-2 mx-auto" />
                <p className="text-sm text-gray-500">Mock QR Code</p>
                <p className="text-xs text-gray-400 mt-1">
                  did:medchain:example123
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <form onSubmit={handleDIDLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="didIdentifier">DID Identifier</Label>
                  <Input
                    id="didIdentifier"
                    placeholder="did:example:123... or email"
                    value={didIdentifier}
                    onChange={(e) => setDidIdentifier(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-medical" disabled={isLoading}>
                  <Wallet className="mr-2 h-4 w-4" />
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
              </form>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Use Demo Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
