import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Book, Code, TestTube, ExternalLink } from "lucide-react";

const API_EXAMPLES = {
  farmers: {
    list: `GET /api/v1/farmers
Authorization: Bearer YOUR_API_KEY

Response:
{
  "data": [
    {
      "id": "uuid",
      "farmer_code": "F001",
      "total_land_acres": 5.2,
      "primary_crops": ["wheat", "rice"],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}`,
    create: `POST /api/v1/farmers
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "farmer_code": "F002",
  "total_land_acres": 3.5,
  "primary_crops": ["cotton"],
  "annual_income_range": "100000-200000",
  "has_irrigation": true
}

Response:
{
  "id": "uuid",
  "farmer_code": "F002",
  "total_land_acres": 3.5,
  "created_at": "2024-01-15T10:30:00Z"
}`
  },
  products: {
    list: `GET /api/v1/products
Authorization: Bearer YOUR_API_KEY

Response:
{
  "data": [
    {
      "id": "uuid",
      "name": "Premium Fertilizer",
      "price_per_unit": 250.00,
      "unit_type": "kg",
      "stock_quantity": 1000,
      "is_active": true
    }
  ]
}`,
    create: `POST /api/v1/products
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "name": "Organic Pesticide",
  "price_per_unit": 150.00,
  "unit_type": "liter",
  "stock_quantity": 500,
  "description": "Natural pest control solution"
}

Response:
{
  "id": "uuid",
  "name": "Organic Pesticide",
  "price_per_unit": 150.00,
  "created_at": "2024-01-15T10:30:00Z"
}`
  }
};

const WEBHOOK_EXAMPLES = {
  farmer_created: `{
  "event": "farmer.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid",
    "farmer_code": "F003",
    "total_land_acres": 2.8,
    "primary_crops": ["sugarcane"],
    "created_at": "2024-01-15T10:30:00Z"
  }
}`,
  product_updated: `{
  "event": "product.updated",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid",
    "name": "Premium Fertilizer",
    "previous_stock": 1000,
    "current_stock": 950,
    "updated_at": "2024-01-15T10:30:00Z"
  }
}`
};

const SDK_EXAMPLES = {
  javascript: `// Install: npm install @your-org/tenant-api
import TenantAPI from '@your-org/tenant-api';

const api = new TenantAPI({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.yourdomain.com'
});

// List farmers
const farmers = await api.farmers.list();

// Create a new farmer
const newFarmer = await api.farmers.create({
  farmer_code: 'F004',
  total_land_acres: 4.2,
  primary_crops: ['wheat']
});`,
  python: `# Install: pip install tenant-api-python
from tenant_api import TenantAPI

api = TenantAPI(api_key='YOUR_API_KEY')

# List farmers
farmers = api.farmers.list()

# Create a new farmer
new_farmer = api.farmers.create({
    'farmer_code': 'F004',
    'total_land_acres': 4.2,
    'primary_crops': ['wheat']
})`,
  curl: `# List farmers
curl -X GET "https://api.yourdomain.com/api/v1/farmers" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Create a farmer
curl -X POST "https://api.yourdomain.com/api/v1/farmers" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "farmer_code": "F004",
    "total_land_acres": 4.2,
    "primary_crops": ["wheat"]
  }'`
};

export function DeveloperPortal() {
  const [selectedExample, setSelectedExample] = useState<string>('farmers.list');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getCurrentExample = () => {
    const [category, action] = selectedExample.split('.');
    return API_EXAMPLES[category as keyof typeof API_EXAMPLES]?.[action as keyof typeof API_EXAMPLES.farmers];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Developer Portal</h2>
        <p className="text-muted-foreground">
          API documentation, code examples, and integration guides
        </p>
      </div>

      <Tabs defaultValue="api-docs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-docs">API Docs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sdks">SDKs</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="api-docs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="w-5 h-5" />
                  <span>Endpoints</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <h4 className="font-medium">Farmers</h4>
                  <div className="space-y-1 ml-4">
                    <Button
                      variant={selectedExample === 'farmers.list' ? 'default' : 'ghost'}
                      size="sm"
                      className="justify-start w-full"
                      onClick={() => setSelectedExample('farmers.list')}
                    >
                      <Badge variant="outline" className="mr-2">GET</Badge>
                      List Farmers
                    </Button>
                    <Button
                      variant={selectedExample === 'farmers.create' ? 'default' : 'ghost'}
                      size="sm"
                      className="justify-start w-full"
                      onClick={() => setSelectedExample('farmers.create')}
                    >
                      <Badge variant="outline" className="mr-2">POST</Badge>
                      Create Farmer
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Products</h4>
                  <div className="space-y-1 ml-4">
                    <Button
                      variant={selectedExample === 'products.list' ? 'default' : 'ghost'}
                      size="sm"
                      className="justify-start w-full"
                      onClick={() => setSelectedExample('products.list')}
                    >
                      <Badge variant="outline" className="mr-2">GET</Badge>
                      List Products
                    </Button>
                    <Button
                      variant={selectedExample === 'products.create' ? 'default' : 'ghost'}
                      size="sm"
                      className="justify-start w-full"
                      onClick={() => setSelectedExample('products.create')}
                    >
                      <Badge variant="outline" className="mr-2">POST</Badge>
                      Create Product
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5" />
                    <span>Example Request</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(getCurrentExample() || '')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{getCurrentExample()}</code>
                </pre>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                All API requests must include your API key in the Authorization header
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Header Authentication</h4>
                  <pre className="bg-muted p-3 rounded text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground">
                    API requests are limited based on your API key configuration. 
                    Rate limit information is included in response headers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Events</CardTitle>
              <CardDescription>
                Real-time notifications for your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">farmer.created</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{WEBHOOK_EXAMPLES.farmer_created}</code>
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">product.updated</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{WEBHOOK_EXAMPLES.product_updated}</code>
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Signature Verification</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Verify webhook authenticity using HMAC-SHA256:
                </p>
                <pre className="bg-muted p-3 rounded text-sm">
{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return \`sha256=\${expectedSignature}\` === signature;
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sdks" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>JavaScript/Node.js SDK</CardTitle>
                <CardDescription>
                  Official SDK for JavaScript and Node.js applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{SDK_EXAMPLES.javascript}</code>
                </pre>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(SDK_EXAMPLES.javascript)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on NPM
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Python SDK</CardTitle>
                <CardDescription>
                  Official SDK for Python applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{SDK_EXAMPLES.python}</code>
                </pre>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(SDK_EXAMPLES.python)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on PyPI
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>cURL Examples</CardTitle>
                <CardDescription>
                  Raw HTTP requests for testing and debugging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{SDK_EXAMPLES.curl}</code>
                </pre>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(SDK_EXAMPLES.curl)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="w-5 h-5" />
                <span>API Testing Console</span>
              </CardTitle>
              <CardDescription>
                Test API endpoints directly from the browser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Method</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Endpoint</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>/api/v1/farmers</option>
                    <option>/api/v1/products</option>
                    <option>/api/v1/orders</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Request Body (JSON)</label>
                <Textarea
                  placeholder='{"farmer_code": "F005", "total_land_acres": 3.0}'
                  className="mt-1 font-mono text-sm"
                  rows={6}
                />
              </div>

              <Button className="w-full">
                <TestTube className="w-4 h-4 mr-2" />
                Send Request
              </Button>

              <div>
                <label className="text-sm font-medium">Response</label>
                <div className="mt-1 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Response will appear here after sending a request
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Postman Collection</CardTitle>
              <CardDescription>
                Import our API collection into Postman for easy testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Download Collection
                </Button>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Environment File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}