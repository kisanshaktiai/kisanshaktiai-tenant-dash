-- Drop remaining existing indexes if they exist
DROP INDEX IF EXISTS idx_dealer_territories_dealer;
DROP INDEX IF EXISTS idx_dealer_performance_dealer_period;
DROP INDEX IF EXISTS idx_dealer_communications_dealer;
DROP INDEX IF EXISTS idx_dealer_incentives_dealer;

-- Recreate indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_dealer_territories_dealer ON public.dealer_territories(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_performance_dealer_period ON public.dealer_performance_history(dealer_id, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_dealer_communications_dealer ON public.dealer_communications(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_incentives_dealer ON public.dealer_incentives(dealer_id);