import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ActionItemsPricing {
  id: string;
  size_type: string;
  employees_range: string;
  price_display: string;
  price_cents: number;
  is_popular: boolean;
  is_quote: boolean;
  display_order: number;
}

export const useActionItemsPricing = () => {
  const [pricingData, setPricingData] = useState<ActionItemsPricing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPricing = async () => {
    console.log('🔄 Fetching action items pricing...');
    try {
      const { data, error } = await supabase
        .from('action_items_pricing')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      console.log('✅ Action items pricing fetched:', data);
      setPricingData(data || []);
    } catch (error) {
      console.error('❌ Error fetching action items pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();

    // Listen for pricing updates from dashboard
    const handlePricingUpdate = () => {
      console.log('Pricing update event received, refetching...');
      fetchPricing();
    };

    // Setup real-time subscription for immediate updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'action_items_pricing'
        },
        (payload) => {
          console.log('Real-time pricing update:', payload);
          fetchPricing();
        }
      )
      .subscribe();

    window.addEventListener('action-items-pricing-updated', handlePricingUpdate);
    
    return () => {
      window.removeEventListener('action-items-pricing-updated', handlePricingUpdate);
      supabase.removeChannel(channel);
    };
  }, []);

  return { pricingData, loading, refetch: fetchPricing };
};