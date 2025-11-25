import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MembershipPricing {
  id: string;
  membership_type: string;
  price: number;
  yearly_price_display: string;
  employees_range: string;
  is_quote: boolean;
  display_order: number;
}

export const useMembershipPricing = () => {
  const [pricingData, setPricingData] = useState<MembershipPricing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPricing = async () => {
    console.log('🔄 Fetching membership pricing...');
    try {
      const { data, error } = await supabase
        .from('membership_pricing')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      console.log('✅ Membership pricing fetched:', data);
      setPricingData(data || []);
    } catch (error) {
      console.error('❌ Error fetching membership pricing:', error);
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
          table: 'membership_pricing'
        },
        (payload) => {
          console.log('Real-time pricing update:', payload);
          fetchPricing();
        }
      )
      .subscribe();

    window.addEventListener('membership-pricing-updated', handlePricingUpdate);
    
    return () => {
      window.removeEventListener('membership-pricing-updated', handlePricingUpdate);
      supabase.removeChannel(channel);
    };
  }, []);

  return { pricingData, loading, refetch: fetchPricing };
};
