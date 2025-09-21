import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Building, Star } from "lucide-react";
import MembershipForm from "./MembershipForm";

type MembershipType = 'zzp' | 'klein' | 'middelgroot' | 'groot';

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

const membershipPlans: MembershipPlan[] = [
  {
    id: 'zzp',
    name: 'ZZP',
    description: 'Perfect voor zelfstandigen',
    price: 25000, // €250 in cents
    yearlyPrice: '€250',
    employees: 'ZZP',
    features: [
      'Toegang tot community',
      'Basis kwaliteitsmerk',
      'Maandelijkse nieuwsbrief',
      'Online resources',
      'Email support'
    ],
    icon: Users
  },
  {
    id: 'klein',
    name: 'Klein',
    description: 'Ideaal voor kleine bedrijven',
    price: 45000, // €450 in cents
    yearlyPrice: '€450',
    employees: '2-10 medewerkers',
    features: [
      'Alle ZZP voordelen',
      'Premium kwaliteitsmerk',
      'Toegang tot exclusieve events',
      'Prioriteit support',
      'Training sessies'
    ],
    popular: true,
    icon: Building
  },
  {
    id: 'middelgroot',
    name: 'Middelgroot',
    description: 'Voor groeiende ondernemingen',
    price: 75000, // €750 in cents
    yearlyPrice: '€750',
    employees: '11-20 medewerkers',
    features: [
      'Alle Klein voordelen',
      'Enterprise kwaliteitsmerk',
      'Dedicated account manager',
      'Maatwerk trainingen',
      'Netwerkbijeenkomsten',
      'Co-branding mogelijkheden'
    ],
    icon: Star
  },
  {
    id: 'groot',
    name: 'Groot',
    description: 'Voor grote ondernemingen',
    price: 0, // Offerte op maat
    yearlyPrice: 'Offerte',
    employees: 'Meer dan 20 medewerkers',
    features: [
      'Alle Middelgroot voordelen',
      'Premium Enterprise kwaliteitsmerk',
      'Dedicated account manager',
      'Volledig maatwerk trainingen',
      'Jaarlijkse bedrijfsaudit',
      'VIP event toegang',
      'Persoonlijke begeleiding'
    ],
    icon: Star
  }
];

const MembershipPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState<MembershipType | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const handlePlanSelect = (planId: MembershipType) => {
    setSelectedPlan(planId);
    setFormOpen(true);
  };

  const selectedPlanData = membershipPlans.find(plan => plan.id === selectedPlan);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {membershipPlans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white' 
                  : 'border border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-yellow-400 text-black text-center py-2 px-4 font-bold text-sm">
                    Populair
                  </div>
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.popular ? 'pt-16' : 'pt-8'}`}>
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${
                  plan.popular 
                    ? 'bg-yellow-100' 
                    : 'bg-primary/10'
                }`}>
                  <IconComponent className={`w-8 h-8 ${
                    plan.popular ? 'text-yellow-600' : 'text-primary'
                  }`} />
                </div>
                
                <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <p className="text-muted-foreground mb-4">{plan.employees}</p>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {plan.yearlyPrice}
                    <span className="text-base font-normal text-muted-foreground">/jaar</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-center text-muted-foreground">{plan.description}</p>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full h-12 font-semibold ${
                    plan.popular 
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-black' 
                      : ''
                  }`}
                  size="lg"
                >
                  Aanmelden
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlanData && (
        <MembershipForm 
          open={formOpen} 
          onOpenChange={setFormOpen}
          membershipPlan={selectedPlanData}
        />
      )}
    </>
  );
};

export default MembershipPlans;