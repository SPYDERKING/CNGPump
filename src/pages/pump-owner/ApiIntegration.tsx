import { useNavigate } from 'react-router-dom';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Eye, EyeOff, Download } from 'lucide-react';
import { useState } from 'react';

const ApiIntegration = () => {
  const navigate = useNavigate();
  const { loading } = useAdminAccess();
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  const apiKey = "sk_cngqueue_pump_abcdefghijklmnopqrstuvwxyz123456";
  
  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    {
      method: "POST",
      path: "/api/bookings",
      description: "Create a new booking",
      example: `curl -X POST https://api.cngqueue.com/api/bookings \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "vehicle_number": "DL12AB1234",
    "fuel_type": "CNG",
    "quantity": 10,
    "pump_id": 123
  }'`
    },
    {
      method: "GET",
      path: "/api/bookings/{id}",
      description: "Get booking details",
      example: `curl -X GET https://api.cngqueue.com/api/bookings/123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      method: "PUT",
      path: "/api/bookings/{id}/status",
      description: "Update booking status",
      example: `curl -X PUT https://api.cngqueue.com/api/bookings/123/status \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "completed"
  }'`
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">API Integration</h1>
          <p className="text-muted-foreground">Integrate our API with your systems for seamless operations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>All API requests must be authenticated using your API key. Include it in the Authorization header:</p>
                <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                  <code className="text-sm">Authorization: Bearer {showApiKey ? apiKey : 'sk_cngqueue_pump_***************************'}</code>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {copied && <p className="text-sm text-green-600">API key copied to clipboard!</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="bookings">
                  <TabsList>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="pumps">Pumps</TabsTrigger>
                    <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="bookings" className="space-y-4 mt-4">
                    {endpoints.map((endpoint, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                            endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm font-mono">{endpoint.path}</code>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                          {endpoint.example}
                        </pre>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="pumps" className="mt-4">
                    <p className="text-muted-foreground">Pump management endpoints coming soon...</p>
                  </TabsContent>
                  
                  <TabsContent value="vehicles" className="mt-4">
                    <p className="text-muted-foreground">Vehicle management endpoints coming soon...</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SDKs & Libraries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Node.js SDK</h3>
                      <p className="text-sm text-muted-foreground">Official JavaScript library</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Install
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Python SDK</h3>
                      <p className="text-sm text-muted-foreground">Official Python library</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Install
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Java SDK</h3>
                      <p className="text-sm text-muted-foreground">Official Java library</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Install
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    API Reference
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Getting Started Guide
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Webhook Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiIntegration;