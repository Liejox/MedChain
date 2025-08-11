import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ArrowLeft, Globe } from "lucide-react";
import { DIDLoginForm } from "@/components/auth/did-login-form";
import { LoginForm } from "@/components/auth/login-form";

export default function Login() {
  const [currentMode, setCurrentMode] = useState<'did' | 'traditional' | 'google'>('did');

  const handleGoogleLogin = async () => {
    // Simulate Google OAuth login for demo
    // In real implementation, this would redirect to Google OAuth
    window.location.href = `https://accounts.google.com/oauth/authorize?` +
      `client_id=demo-client-id&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&` +
      `response_type=code&` +
      `scope=openid profile email`;
  };

  if (currentMode === 'did') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="w-full max-w-md">
          <DIDLoginForm 
            onSwitchToGoogle={() => setCurrentMode('google')} 
          />
          
          {/* Traditional Login Fallback */}
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => setCurrentMode('traditional')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600"
              data-testid="button-traditional-fallback"
            >
              Use traditional username/password instead
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentMode === 'google') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="w-full max-w-md">
          <Card className="glassmorphism">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Google Authentication
                </h1>
              </div>
              <CardDescription>
                Continue with your Google account as a fallback authentication method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Google OAuth is configured as a fallback method. 
                  DID authentication is the primary and more secure option for healthcare data.
                </p>
              </div>

              <Button
                onClick={handleGoogleLogin}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                data-testid="button-google-login"
              >
                <Globe className="h-4 w-4 mr-2" />
                Continue with Google
              </Button>

              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                <p>This will redirect to Google's secure authentication</p>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setCurrentMode('did')}
                className="w-full"
                data-testid="button-back-to-did"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to DID Authentication
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Traditional login fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="glassmorphism">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Traditional Login
              </h1>
            </div>
            <CardDescription>
              Username/password authentication fallback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>For security:</strong> DID authentication is recommended for healthcare data. 
                This traditional method is provided as a fallback.
              </p>
            </div>

            <LoginForm />

            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentMode('did')}
                className="w-full"
                data-testid="button-back-to-did-traditional"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to DID Authentication
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}