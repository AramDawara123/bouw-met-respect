import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Building, Star } from "lucide-react";
import MembershipForm from "./MembershipForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
type MembershipType = 'klein' | 'middelgroot' | 'groot';
interface MembershipPlan {
  id: MembershipType;
  name: string;
  description: string;
  price: number;
  yearlyPrice: string;
  employees: string;
  features: string[];
  popular?: boolean;
  icon: any;
}
interface MembershipPricingData {
  membership_type: string;
  price: number;
  yearly_price_display: string;
  employees_range: string;
}
const MembershipPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState<MembershipType | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const {
    toast
  } = useToast();

  // Load membership pricing from database
  useEffect(() => {
    const fetchMembershipPricing = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('membership_pricing').select('*').order('price', {
          ascending: true
        });
        if (error) throw error;
        const plans: MembershipPlan[] = data.map((pricing: MembershipPricingData) => {
          const baseFeatures = getBaseFeaturesForType(pricing.membership_type as MembershipType);
          return {
            id: pricing.membership_type as MembershipType,
            name: pricing.membership_type.charAt(0).toUpperCase() + pricing.membership_type.slice(1),
            description: getDescriptionForType(pricing.membership_type as MembershipType),
            price: pricing.price,
            yearlyPrice: pricing.yearly_price_display,
            employees: pricing.employees_range,
            features: baseFeatures,
            popular: pricing.membership_type === 'middelgroot',
            icon: getIconForType(pricing.membership_type as MembershipType)
          };
        });
        setMembershipPlans(plans);
      } catch (error) {
        console.error('Error fetching membership pricing:', error);
        toast({
          title: "Fout",
          description: "Kon lidmaatschapprijzen niet laden",
          variant: "destructive"
        });
        // Fallback to hardcoded plans
        setMembershipPlans(getDefaultPlans());
      }
    };
    fetchMembershipPricing();

    // Listen for pricing updates from admin panel
    const handlePricingUpdate = () => {
      fetchMembershipPricing();
    };
    window.addEventListener('membership-pricing-updated', handlePricingUpdate);
    return () => {
      window.removeEventListener('membership-pricing-updated', handlePricingUpdate);
    };
  }, [toast]);
  const getBaseFeaturesForType = (type: MembershipType): string[] => {
    switch (type) {
      case 'klein':
        return ['Toegang tot community', 'Basis kwaliteitsmerk', 'Maandelijkse nieuwsbrief', 'Online resources', 'Email support'];
      case 'middelgroot':
        return ['Alle Klein voordelen', 'Premium kwaliteitsmerk', 'Toegang tot exclusieve events', 'Prioriteit support', 'Training sessies', 'Netwerkbijeenkomsten'];
      case 'groot':
        return ['Alle Middelgroot voordelen', 'Enterprise kwaliteitsmerk', 'Dedicated account manager', 'Maatwerk trainingen', 'Co-branding mogelijkheden', 'Jaarlijkse bedrijfsaudit', 'VIP event toegang'];
    }
  };
  const getDescriptionForType = (type: MembershipType): string => {
    switch (type) {
      case 'klein':
        return 'Perfect voor kleine bedrijven';
      case 'middelgroot':
        return 'Ideaal voor groeiende bedrijven';
      case 'groot':
        return 'Voor gevestigde ondernemingen';
    }
  };
  const getIconForType = (type: MembershipType) => {
    switch (type) {
      case 'klein':
        return Users;
      case 'middelgroot':
        return Building;
      case 'groot':
        return Star;
    }
  };
  const getDefaultPlans = (): MembershipPlan[] => [{
    id: 'klein',
    name: 'Klein',
    description: 'Perfect voor kleine bedrijven',
    price: 25000,
    yearlyPrice: '€250',
    employees: '1-10 medewerkers',
    features: ['Toegang tot community', 'Basis kwaliteitsmerk', 'Maandelijkse nieuwsbrief', 'Online resources', 'Email support'],
    icon: Users
  }, {
    id: 'middelgroot',
    name: 'Middelgroot',
    description: 'Ideaal voor groeiende bedrijven',
    price: 75000,
    yearlyPrice: '€750',
    employees: '11-30 medewerkers',
    features: ['Alle Klein voordelen', 'Premium kwaliteitsmerk', 'Toegang tot exclusieve events', 'Prioriteit support', 'Training sessies', 'Netwerkbijeenkomsten'],
    popular: true,
    icon: Building
  }, {
    id: 'groot',
    name: 'Groot',
    description: 'Voor gevestigde ondernemingen',
    price: 125000,
    yearlyPrice: '€1250',
    employees: '31-50 medewerkers',
    features: ['Alle Middelgroot voordelen', 'Enterprise kwaliteitsmerk', 'Dedicated account manager', 'Maatwerk trainingen', 'Co-branding mogelijkheden', 'Jaarlijkse bedrijfsaudit', 'VIP event toegang'],
    icon: Star
  }];
  const handlePlanSelect = (planId: MembershipType) => {
    setSelectedPlan(planId);
    setFormOpen(true);
  };
  const selectedPlanData = membershipPlans.find(plan => plan.id === selectedPlan);
  return <>
      

      {selectedPlanData && <MembershipForm open={formOpen} onOpenChange={setFormOpen} membershipPlan={selectedPlanData} />}
    </>;
};
export default MembershipPlans;