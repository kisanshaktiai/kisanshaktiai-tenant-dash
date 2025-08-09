import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    const results = [];

    // Test 1: Basic Connection
    try {
      const { data, error } = await supabase.from('tenants').select('count').limit(1);
      results.push({
        test: 'Database Connection',
        status: error ? 'error' : 'success',
        message: error?.message || 'Connected successfully',
        data: data
      });
    } catch (err: any) {
      results.push({
        test: 'Database Connection',
        status: 'error',
        message: err.message,
        data: null
      });
    }

    // Test 2: Insert Test Lead
    try {
      const testLead = {
        organization_name: 'Test Organization',
        organization_type: 'agri_company',
        contact_name: 'Test Contact',
        email: 'test@example.com',
        phone: '+1234567890', // Added required phone field
        lead_source: 'website',
        status: 'new',
        priority: 'medium',
        metadata: {}
      };

      const { data, error } = await supabase
        .from('leads')
        .insert(testLead)
        .select()
        .single();

      results.push({
        test: 'Insert Test Lead',
        status: error ? 'error' : 'success',
        message: error?.message || 'Lead inserted successfully',
        data: data
      });

      // Clean up - delete the test lead
      if (data?.id) {
        await supabase.from('leads').delete().eq('id', data.id);
      }
    } catch (err: any) {
      results.push({
        test: 'Insert Test Lead',
        status: 'error',
        message: err.message,
        data: null
      });
    }

    // Test 3: Check User Authentication
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      results.push({
        test: 'User Authentication',
        status: user ? 'success' : 'error',
        message: error?.message || (user ? 'User is authenticated' : 'No user session'),
        data: user
      });
    } catch (err: any) {
      results.push({
        test: 'User Authentication',
        status: 'error',
        message: err.message,
        data: null
      });
    }

    // Test 4: Check Storage Bucket Access
    try {
      const { data, error } = await supabase.storage.from('avatars').list('', {
        limit: 1,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

      results.push({
        test: 'Storage Bucket Access',
        status: error ? 'error' : 'success',
        message: error?.message || 'Storage bucket accessed successfully',
        data: data
      });
    } catch (err: any) {
      results.push({
        test: 'Storage Bucket Access',
        status: 'error',
        message: err.message,
        data: null
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      success: "default",
      error: "destructive",
      warning: "secondary"
    };
    return variants[status] || "outline";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Database Connection Tests
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            size="sm"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Tests
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{result.test}</span>
                  <Badge variant={getStatusBadge(result.status)}>
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {result.message}
                </p>
                {result.data && (
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseTest;
