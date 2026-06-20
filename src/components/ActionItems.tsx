import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Building2, TrendingUp, Shield, ArrowRight, CheckCircle, Euro, Users, Award, Calendar, Clock, Video, MapPin, PhoneCall } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState } from "react";
import MembershipForm from "@/components/MembershipForm";
import { useMembershipPricing } from "@/hooks/useMembershipPricing";
import { useToast } from "@/hooks/use-toast";
interface MembershipPricingData {
  id: string;
  membership_type: string;
  price: number;
  yearly_price_display: string;
  employees_range: string;
  is_quote: boolean;
  display_order: number;
}

const ActionItems = () => {
  const {
    ref: headerRef,
    isVisible: headerVisible
  } = useScrollAnimation(0.2);
  const {
    ref: pricingRef,
    isVisible: pricingVisible
  } = useScrollAnimation(0.1);
  const {
    ref: cardsRef,
    isVisible: cardsVisible
  } = useScrollAnimation(0.1);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMembershipType, setSelectedMembershipType] = useState<string | null>(null);
  const {
    pricingData,
    loading: pricingLoading
  } = useMembershipPricing();
  const {
    toast
  } = useToast();
  const businessValues = [{
    icon: TrendingUp,
    title: "Vermindering van problemen onder personeel",
    description: "Minder conflicten en een betere werksfeer leiden tot verhoogde productiviteit en behoud van waardevolle medewerkers.",
    features: ["Minder ziekteverzuim", "Betere werksfeer", "Hoger behoud personeel"],
    gradient: "from-emerald-500/10 to-green-600/10"
  }, {
    icon: Shield,
    title: "Sterker imago en verantwoord inkopen",
    description: "Toon actief bij te dragen aan een sociaal veilige bouwplaats. Aantrekkelijk keurmerk voor opdrachtgevers die verantwoordelijk inkopen.",
    features: ["Positief imago", "Aantrekkelijk voor opdrachtgevers", "Keurmerk zichtbaarheid"],
    gradient: "from-blue-500/10 to-indigo-600/10"
  }, {
    icon: Building2,
    title: "Minder juridische conflicten",
    description: "Proactieve aanpak van sociale veiligheid voorkomt juridische problemen en vermindert kosten van conflictoplossing.",
    features: ["Minder rechtszaken", "Lagere kosten", "Preventieve aanpak"],
    gradient: "from-purple-500/10 to-violet-600/10"
  }, {
    icon: Target,
    title: "Keurmerk en zichtbaarheid",
    description: "Ontvang een bordje voor op de gevel en vermelding op onze website. Laat zien dat jullie aangesloten zijn bij de beweging.",
    features: ["Gevelbordje", "Website vermelding", "Certificaat"],
    gradient: "from-orange-500/10 to-red-600/10"
  }];
  const getIconForMembershipType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'klein':
        return Users;
      case 'middelgroot':
        return Building2;
      case 'groot':
        return Award;
      default:
        return Users;
    }
  };

  // Transform membership pricing data for display
  const allTiers = pricingData.map((pricing: MembershipPricingData) => ({
    id: pricing.membership_type,
    icon: getIconForMembershipType(pricing.membership_type),
    size: pricing.membership_type.charAt(0).toUpperCase() + pricing.membership_type.slice(1),
    employees: pricing.employees_range,
    price: pricing.yearly_price_display,
    popular: pricing.membership_type === 'middelgroot',
    isQuote: pricing.is_quote || false
  }));

  const handlePlanClick = (tierId: string) => {
    setSelectedMembershipType(tierId);
    setFormOpen(true);
  };

  // Build a safe, encoded SVG background for the decoration without nesting quotes in JSX
  const backgroundSvg = `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#f97316" fill-opacity="0.03"><circle cx="30" cy="30" r="2"/></g></g></svg>`;
  const backgroundDataUrl = `url("data:image/svg+xml,${encodeURIComponent(backgroundSvg)}")`;
  return <section id="actie" className="py-24 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
      backgroundImage: backgroundDataUrl,
      backgroundRepeat: 'repeat'
    }}></div>
      
      <div className="container mx-auto px-4 relative">
        <div ref={headerRef} className={`text-center mb-20 transition-all duration-500 ${headerVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
            <Target className="w-4 h-4 mr-2" />
            Waarde voor bedrijven
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Investeer in sociale veiligheid
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed px-4">
            Ontdek waarom steeds meer bedrijven zich aansluiten bij onze beweging 
            en investeren in een sociaal veilige bouwplaats. Een kleine investering met grote impact.
          </p>
        </div>

        {/* Schedule Appointment Section */}
        <div ref={pricingRef} className={`mb-20 transition-all duration-500 ${pricingVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <div className="relative max-w-6xl mx-auto">
            {/* Decorative glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 rounded-3xl blur-2xl opacity-60"></div>

            <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl shadow-2xl">
              {/* Background pattern */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

              <div className="relative grid lg:grid-cols-2 gap-0">
                {/* Left: Content */}
                <div className="p-8 sm:p-12 lg:p-16">
                  <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
                    <Calendar className="w-4 h-4 mr-2" />
                    Plan een kennismaking
                  </div>

                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-accent leading-tight">
                    Laten we kennismaken onder het genot van een kop koffie
                  </h3>

                  <p className="text-lg text-accent/80 leading-relaxed mb-8">
                    Benieuwd hoe wij samen met jouw bedrijf bouwen aan een sociaal veilige bouwplaats?
                    Plan vrijblijvend een gesprek in &mdash; online of op locatie. Persoonlijk, eerlijk en zonder verplichtingen.
                  </p>

                  <ul className="space-y-4 mb-10">
                    {[
                      { icon: Clock, text: "30 minuten vrijblijvend gesprek" },
                      { icon: Video, text: "Online via videocall of fysiek op locatie" },
                      { icon: CheckCircle, text: "Advies op maat voor jouw organisatie" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-accent font-medium pt-2">{item.text}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/contact" className="flex-1">
                      <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all">
                        <Calendar className="w-5 h-5 mr-2" />
                        Afspraak inplannen
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <a href="tel:+31000000000" className="flex-1">
                      <Button size="lg" variant="outline" className="w-full border-2 border-primary/30 hover:bg-primary/5 font-semibold">
                        <PhoneCall className="w-5 h-5 mr-2" />
                        Direct bellen
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Right: Calendar visual */}
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-12 lg:p-16 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                  }}></div>

                  <div className="relative w-full max-w-sm">
                    {/* Floating calendar card */}
                    <div className="bg-card rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Beschikbaar</p>
                          <p className="text-lg font-bold text-accent">Deze week</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        {[
                          { day: "Di", date: "10:00", label: "Online kennismaking" },
                          { day: "Wo", date: "14:30", label: "Bedrijfsbezoek" },
                          { day: "Vr", date: "09:00", label: "Online kennismaking" },
                        ].map((slot, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-primary/10 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-lg bg-primary/15 flex flex-col items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">{slot.day}</span>
                              <span className="text-[10px] text-primary/70">{slot.date}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-accent truncate">{slot.label}</p>
                              <p className="text-xs text-muted-foreground">30 minuten</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>Online of op locatie</span>
                      </div>
                    </div>

                    {/* Floating badge */}
                    <div className="absolute -top-4 -left-4 bg-card rounded-xl shadow-xl px-4 py-3 flex items-center gap-2 transform -rotate-6">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-semibold text-accent">Reactie binnen 24u</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>


        {/* Business Values Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto px-4">
          {businessValues.map((value, index) => <Card key={index} className={`group relative p-4 sm:p-6 lg:p-8 transition-all duration-400 border-0 hover:shadow-2xl hover:scale-[1.02] bg-gradient-to-br ${value.gradient} backdrop-blur-sm ${cardsVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform ' + (index % 2 === 0 ? '-translate-x-12' : 'translate-x-12')}`} style={{
          transitionDelay: cardsVisible ? `${index * 120}ms` : '0ms'
        }}>
              {/* Subtle border gradient */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 p-[1px]">
                <div className="h-full w-full rounded-lg bg-card border-2 border-primary"></div>
              </div>
              
              <div className="relative flex items-start space-x-6">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <value.icon className="w-8 h-8 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-4 text-accent group-hover:text-accent transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-accent/80 leading-relaxed mb-6">
                    {value.description}
                  </p>
                  <ul className="space-y-3">
                    {value.features.map((feature, idx) => <li key={idx} className="flex items-center text-sm text-accent group-hover:text-accent transition-colors duration-300">
                        <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-primary" />
                        </div>
                        {feature}
                      </li>)}
                  </ul>
                </div>
              </div>
            </Card>)}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <Button size="lg" onClick={() => handlePlanClick('klein')} className="px-8 py-4 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 text-[01428b] text-[#01428b]">
            <Euro className="w-5 h-5 mr-2" />
            Word onderdeel van de beweging
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Gevelbordje en website vermelding inbegrepen
          </p>
        </div>
      </div>
      
      <MembershipForm 
        open={formOpen} 
        onOpenChange={setFormOpen}
        membershipPlan={selectedMembershipType ? {
          id: selectedMembershipType,
          name: selectedMembershipType === 'offerte' ? 'Offerte' : selectedMembershipType.charAt(0).toUpperCase() + selectedMembershipType.slice(1),
          price: pricingData.find(p => p.membership_type === selectedMembershipType)?.price || 0,
          yearlyPrice: pricingData.find(p => p.membership_type === selectedMembershipType)?.yearly_price_display || 'Op maat'
        } : undefined}
      />
    </section>;
};
export default ActionItems;