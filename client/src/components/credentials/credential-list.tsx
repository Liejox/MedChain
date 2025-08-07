import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Award, 
  Eye, 
  Share,
  Shield,
  Search,
  Filter,
  Download,
  Clock
} from "lucide-react";

export function CredentialList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [filteredCredentials, setFilteredCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchCredentials();
  }, []);

  useEffect(() => {
    filterCredentials();
  }, [credentials, searchTerm, typeFilter]);

  const fetchCredentials = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/credentials", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCredentials(data);
      }
    } catch (error) {
      console.error("Failed to fetch credentials:", error);
      toast({
        title: "Error",
        description: "Failed to load credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCredentials = () => {
    let filtered = credentials;

    if (searchTerm) {
      filtered = filtered.filter(cred =>
        cred.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cred.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(cred => cred.type === typeFilter);
    }

    setFilteredCredentials(filtered);
  };

  const getCredentialIcon = (type: string) => {
    return <Award className="h-4 w-4 text-digital-purple" />;
  };

  const getCredentialTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      vaccination: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      diagnosis: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      surgery: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
      "lab-result": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    };
    return colors[type] || "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handleViewCredential = (credential: any) => {
    toast({
      title: "Credential Details",
      description: "Credential viewer would open here",
    });
  };

  const handleShare = (credential: any) => {
    toast({
      title: "Share Credential",
      description: "Share functionality would open here",
    });
  };

  const handleDownload = (credential: any) => {
    toast({
      title: "Download",
      description: "Credential download started",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="vaccination">Vaccination</SelectItem>
            <SelectItem value="diagnosis">Diagnosis</SelectItem>
            <SelectItem value="surgery">Surgery</SelectItem>
            <SelectItem value="lab-result">Lab Results</SelectItem>
            <SelectItem value="prescription">Prescription</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Credentials List */}
      {filteredCredentials.length === 0 ? (
        <Card className="glassmorphism dark:glassmorphism-dark">
          <CardContent className="p-12 text-center">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No credentials found
            </h3>
            <p className="text-cool-gray dark:text-gray-400">
              {searchTerm || typeFilter !== "all" 
                ? "Try adjusting your search or filters"
                : user?.role === "patient" 
                  ? "You haven't received any credentials yet"
                  : "You haven't issued any credentials yet"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCredentials.map((credential) => (
            <Card key={credential.id} className="glassmorphism dark:glassmorphism-dark card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-digital-purple/10 rounded-lg flex items-center justify-center">
                      {getCredentialIcon(credential.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {credential.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getCredentialTypeColor(credential.type)}>
                          {credential.type}
                        </Badge>
                        <span className="text-sm text-cool-gray dark:text-gray-400">
                          Issued: {new Date(credential.issuedAt).toLocaleDateString()}
                        </span>
                        {credential.expiresAt && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className={`text-xs ${isExpired(credential.expiresAt) ? 'text-red-500' : 'text-gray-500'}`}>
                              {isExpired(credential.expiresAt) 
                                ? 'Expired' 
                                : `Expires: ${new Date(credential.expiresAt).toLocaleDateString()}`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                      {credential.description && (
                        <p className="text-sm text-cool-gray dark:text-gray-400 mt-1">
                          {credential.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!credential.isRevoked && !isExpired(credential.expiresAt) && (
                      <Badge className="status-verified">
                        <Shield className="mr-1 h-3 w-3" />
                        Valid
                      </Badge>
                    )}
                    {credential.isRevoked && (
                      <Badge className="status-error">
                        Revoked
                      </Badge>
                    )}
                    {isExpired(credential.expiresAt) && (
                      <Badge className="status-error">
                        Expired
                      </Badge>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewCredential(credential)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShare(credential)}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(credential)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
