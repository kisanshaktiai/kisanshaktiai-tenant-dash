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
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ NDVI queue subscription error');
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
