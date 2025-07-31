
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

      // Test 2: Test RLS policies for anonymous users (INSERT)
      addResult('Testing anonymous lead submission...');
      const testLead = {
        organization_name: 'Test Organization',
        organization_type: 'Agri_Company',
        contact_name: 'Test User',
        email: 'test@example.com',
        lead_source: 'website',
        status: 'new',
        priority: 'medium',
        metadata: {}
      };

      const { data: insertData, error: insertError } = await supabase
        .from('leads')
        .insert(testLead)
        .select()
        .single();

      if (insertError) {
        addResult(`❌ Insert failed: ${insertError.message} (Code: ${insertError.code})`);
      } else {
        addResult('✅ Anonymous lead submission successful - RLS policies working correctly');
        
        // Clean up test data
        if (insertData?.id) {
          const { error: deleteError } = await supabase
            .from('leads')
            .delete()
            .eq('id', insertData.id);
          
          if (deleteError) {
            addResult(`⚠️ Test data cleanup failed: ${deleteError.message}`);
          } else {
            addResult('✅ Test data cleaned up successfully');
          }
        }
      }

      // Test 3: Check basic read permissions
      addResult('Testing basic read permissions...');
      const { data: permissionData, error: permissionError } = await supabase
        .from('leads')
        .select('id, organization_name, status')
        .limit(1);

      if (permissionError) {
        addResult(`❌ Permission test failed: ${permissionError.message}`);
      } else {
        addResult('✅ Basic read permissions working');
        if (permissionData && permissionData.length > 0) {
          addResult(`✅ Found ${permissionData.length} existing leads`);
        } else {
          addResult('ℹ️ No existing leads found (this is normal for a fresh database)');
        }
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
        <CardTitle>Database Connection & RLS Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testDatabaseConnection} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Run Database Tests'}
        </Button>
        
        {testResults.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className={`
                    ${result.includes('❌') ? 'text-red-600' : ''}
                    ${result.includes('✅') ? 'text-green-600' : ''}
                    ${result.includes('⚠️') ? 'text-yellow-600' : ''}
                    ${result.includes('ℹ️') ? 'text-blue-600' : ''}
                  `}>
                    {result}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </Content>
    </Card>
  );
};
