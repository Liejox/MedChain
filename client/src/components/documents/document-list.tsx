import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Eye, 
  Share,
  Shield,
  Search,
  Filter
} from "lucide-react";

export function DocumentList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, typeFilter]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    setFilteredDocuments(filtered);
  };

  const getDocumentIcon = (type: string) => {
    return <FileText className="h-4 w-4 text-blue-600" />;
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      prescription: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      "lab-report": "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      diagnosis: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
      image: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    };
    return colors[type] || "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
  };

  const handleViewDocument = (document: any) => {
    toast({
      title: "Document Viewer",
      description: "Document viewer would open here",
    });
  };

  const handleDownload = (document: any) => {
    toast({
      title: "Download",
      description: "Document download started",
    });
  };

  const handleShare = (document: any) => {
    toast({
      title: "Share Document",
      description: "Share functionality would open here",
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
            placeholder="Search documents..."
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
            <SelectItem value="prescription">Prescription</SelectItem>
            <SelectItem value="lab-report">Lab Report</SelectItem>
            <SelectItem value="diagnosis">Diagnosis</SelectItem>
            <SelectItem value="image">Medical Image</SelectItem>
            <SelectItem value="discharge-summary">Discharge Summary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card className="glassmorphism dark:glassmorphism-dark">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No documents found
            </h3>
            <p className="text-cool-gray dark:text-gray-400">
              {searchTerm || typeFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "Upload your first medical document to get started"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="glassmorphism dark:glassmorphism-dark card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      {getDocumentIcon(document.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {document.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getDocumentTypeColor(document.type)}>
                          {document.type}
                        </Badge>
                        <span className="text-sm text-cool-gray dark:text-gray-400">
                          {new Date(document.createdAt).toLocaleDateString()}
                        </span>
                        {document.isVerified && (
                          <Badge className="status-verified">
                            <Shield className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewDocument(document)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShare(document)}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(document)}
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
