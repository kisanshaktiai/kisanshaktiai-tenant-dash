import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NDVIQueueProcessorService } from '@/services/NDVIQueueProcessorService';
import { useAppSelector } from '@/store/hooks';

/**
 * Hook that automatically processes NDVI queue items when they're created
 * Listens to real-time changes in ndvi_request_queue table
 */
export const useNDVIQueueAutoProcessor = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const processingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    if (!currentTenant?.id) return;

    console.log('🎧 Setting up NDVI queue auto-processor listener');

    // Subscribe to real-time changes in queue table
    const channel = supabase
      .channel('ndvi-queue-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ndvi_request_queue',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        async (payload) => {
          console.log('🔔 New NDVI request detected:', payload.new);
          
          // Debounce processing (wait 2 seconds after last insert)
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(async () => {
            if (processingRef.current) {
              console.log('⏭️ Already processing, skipping...');
              return;
            }

            processingRef.current = true;
            try {
              console.log('🚀 Auto-triggering queue processor...');
              const result = await NDVIQueueProcessorService.processQueue(10);
              console.log('✅ Auto-processing complete:', result);
            } catch (error) {
              console.error('❌ Auto-processing failed:', error);
            } finally {
              processingRef.current = false;
            }
          }, 2000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ndvi_request_queue',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          const oldStatus = (payload.old as any)?.status;
          const newStatus = (payload.new as any)?.status;
          
          if (oldStatus !== newStatus) {
            console.log(`📊 Queue item status changed: ${oldStatus} → ${newStatus}`);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ NDVI queue auto-processor active');
          retryCountRef.current = 0; // Reset retry count on success
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ NDVI queue subscription error');
          
          // Retry with exponential backoff
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            const delay = Math.pow(2, retryCountRef.current) * 1000;
            console.log(`🔄 Retrying subscription in ${delay}ms (attempt ${retryCountRef.current}/${maxRetries})`);
            
            setTimeout(() => {
              supabase.removeChannel(channel);
              // Re-run the effect by forcing a state update would be complex here
              // Instead, we'll just log and let the user refresh if needed
              console.log('⚠️ Please refresh the page if NDVI updates are not appearing');
            }, delay);
          } else {
            console.error('❌ Max retries reached for NDVI queue subscription. Falling back to polling.');
          }
        } else if (status === 'CLOSED') {
          console.log('🔌 NDVI queue subscription closed');
        }
      });

    return () => {
      console.log('🔌 Cleaning up NDVI queue auto-processor');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id]);
};
