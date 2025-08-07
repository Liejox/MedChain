import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Eye,
  Copy,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VerifyCredential() {
  const { toast } = useToast();
  const [vcInput, setVcInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!vcInput.trim()) {
      toast({
        title: "Error",
        description: "Please paste a verifiable credential to verify",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const response = await fetch('/api/credentials/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vcData: vcInput })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const result = await response.json();
      setVerificationResult(result);
      
      toast({
        title: "Verification Complete",
        description: result.verification.isValid ? "Credential is valid" : "Credential verification failed",
        variant: result.verification.isValid ? "default" : "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive"
      });
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
      variant: "default"
    });
  };

  const sampleVC = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "HealthCheckupCredential"],
    "issuer": "did:example:doctor123",
    "issuanceDate": "2025-08-07T10:00:00Z",
    "credentialSubject": {
      "id": "did:example:patient456",
      "patientName": "John Doe",
      "checkupDate": "2025-08-07",
      "bloodPressure": "120/80 mmHg",
      "heartRate": "72 bpm",
      "summary": "Normal vital signs. Patient is in good health."
    },
    "proof": {
      "type": "Ed25519Signature2020",
      "created": "2025-08-07T10:01:00Z",
      "verificationMethod": "did:example:doctor123#key-1",
      "proofPurpose": "assertionMethod",
      "jws": "eyJmockSignature..."
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Shield className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Credential Verification
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Verify the authenticity and validity of healthcare credentials
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Section */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-blue-600" />
                Verify Credential
              </CardTitle>
              <CardDescription>
                Paste a W3C Verifiable Credential in JSON format to verify its authenticity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Verifiable Credential (JSON)
                </label>
                <Textarea
                  placeholder="Paste your verifiable credential JSON here..."
                  value={vcInput}
                  onChange={(e) => setVcInput(e.target.value)}
                  className="font-mono text-sm min-h-[300px]"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleVerify} 
                  className="btn-medical flex-1"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Credential
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setVcInput(JSON.stringify(sampleVC, null, 2))}
                >
                  Load Sample
                </Button>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Verification checks:</strong> Digital signature, expiration date, 
                  issuer validity, and database record existence.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-green-600" />
                Verification Results
              </CardTitle>
              <CardDescription>
                Detailed verification status and credential information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!verificationResult ? (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Verification Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Paste a verifiable credential and click verify to see the results here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Overall Status */}
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {verificationResult.verification.isValid ? (
                      <div className="space-y-2">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                        <h3 className="text-xl font-bold text-green-600">
                          Credential Valid
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          This credential has been successfully verified
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                        <h3 className="text-xl font-bold text-red-600">
                          Credential Invalid
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          This credential failed verification
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Verification Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Verification Details
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        {verificationResult.verification.signature === 'valid' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Digital Signature</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!verificationResult.verification.expired ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Not Expired</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {verificationResult.verification.existsInDatabase ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Database Record</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {verificationResult.verification.credentialType}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Credential Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Credential Information
                    </h4>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Issuer:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs">{verificationResult.verification.issuer}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(verificationResult.verification.issuer)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs">{verificationResult.verification.subject}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(verificationResult.verification.subject)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Issued:</span>
                        <span>{new Date(verificationResult.verification.issuanceDate).toLocaleDateString()}</span>
                      </div>
                      
                      {verificationResult.verification.expirationDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                          <span>{new Date(verificationResult.verification.expirationDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Raw Credential Data */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Raw Credential Data
                    </h4>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-h-60 overflow-auto">
                      <pre className="text-xs font-mono">
                        {JSON.stringify(verificationResult.vcData, null, 2)}
                      </pre>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(verificationResult.vcData, null, 2))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Raw Data
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              About Credential Verification
            </CardTitle>
            <CardDescription>
              Understanding the verification process
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Cryptographic Proof</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifies the digital signature using the issuer's public key to ensure the credential hasn't been tampered with.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Validity Period</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Checks if the credential is within its valid time frame and hasn't expired.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold">Issuer Authority</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Validates that the credential was issued by an authorized healthcare provider in our system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}