import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import Credentials from "@/pages/credentials";
import DIDProfile from "@/pages/did-profile";
import Appointments from "@/pages/appointments";
import Settings from "@/pages/settings";
import Verify from "@/pages/verify";

function AppContent() {
  const { user, isLoading } = useAuth();
  useWebSocket(); // Initialize WebSocket connection

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-blue"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/documents" component={Documents} />
          <Route path="/credentials" component={Credentials} />
          <Route path="/did-profile" component={DIDProfile} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/verify" component={Verify} />
          <Route path="/settings" component={Settings} />
          {/* Add role-specific routes */}
          {user.role === "doctor" && (
            <>
              <Route path="/patients" component={Dashboard} />
            </>
          )}
          {user.role === "admin" && (
            <>
              <Route path="/users" component={Dashboard} />
              <Route path="/doctors" component={Dashboard} />
              <Route path="/hospitals" component={Dashboard} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route component={AppContent} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="medchain-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
