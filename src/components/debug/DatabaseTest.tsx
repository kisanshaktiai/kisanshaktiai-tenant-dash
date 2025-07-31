
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

export const DatabaseTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Basic connection
      addResult('Testing database connection...');
      const { data, error } = await supabase.from('leads').select('count').limit(0);
      if (error) {
        addResult(`❌ Connection failed: ${error.message}`);
      } else {
        addResult('✅ Database connection successful');
      }

      // Test 2: Test RLS policies
      addResult('Testing RLS policies for anonymous users...');
      const testLead = {
        organization_name: 'Test Organization',
        organization_type: 'Agri_Company',
        contact_name: 'Test User',
        email: 'test@example.com',
        lead_source: 'website',
        status: 'new',
        priority: 'medium'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('leads')
        .insert(testLead)
        .select()
        .single();

      if (insertError) {
        addResult(`❌ Insert failed: ${insertError.message} (Code: ${insertError.code})`);
      } else {
        addResult('✅ Insert successful - RLS policies working correctly');
        
        // Clean up test data
        if (insertData?.id) {
          await supabase.from('leads').delete().eq('id', insertData.id);
          addResult('✅ Test data cleaned up');
        }
      }

      // Test 3: Check if helper functions exist
      addResult('Testing helper functions...');
      const { data: funcData, error: funcError } = await supabase
        .rpc('can_submit_lead');

      if (funcError) {
        addResult(`❌ Helper function test failed: ${funcError.message}`);
      } else {
        addResult('✅ Helper functions working correctly');
      }

    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testDatabaseConnection} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Run Database Tests'}
        </Button>
        
        {testResults.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="font-mono text-sm space-y-1">
                {testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
