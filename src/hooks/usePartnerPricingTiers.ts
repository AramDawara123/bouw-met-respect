import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PartnerPricingTier {
  id: string;
  employee_range: string;
  price_display: string;
  price_cents: number;
  is_quote: boolean;
  display_order: number;
  is_active: boolean;
}

export const usePartnerPricingTiers = () => {
  const [pricingTiers, setPricingTiers] = useState<PartnerPricingTier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPricingTiers = async () => {
    console.log('🔄 Fetching partner pricing tiers...');
    try {
      const { data, error } = await supabase
        .from('partner_pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      console.log('✅ Partner pricing tiers fetched:', data);
      setPricingTiers(data || []);
    } catch (error) {
      console.error('❌ Error fetching partner pricing tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingTiers();

    // Listen for pricing updates from dashboard
    const handlePricingUpdate = () => {
      console.log('Partner pricing update event received, refetching...');
      fetchPricingTiers();
    };

    // Setup real-time subscription for immediate updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partner_pricing_tiers'
        },
        (payload) => {
          console.log('Real-time partner pricing update:', payload);
          fetchPricingTiers();
        }
      )
      .subscribe();

    window.addEventListener('partner-pricing-updated', handlePricingUpdate);
    
    return () => {
      window.removeEventListener('partner-pricing-updated', handlePricingUpdate);
      supabase.removeChannel(channel);
    };
  }, []);

  return { pricingTiers, loading, refetch: fetchPricingTiers };
};