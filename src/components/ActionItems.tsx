
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Building2, TrendingUp, Shield, ArrowRight, CheckCircle, Euro, Users, Award } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState } from "react";
import MembershipForm from "@/components/MembershipForm";

const ActionItems = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.2);
  const { ref: pricingRef, isVisible: pricingVisible } = useScrollAnimation(0.1);
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation(0.1);
  const [formOpen, setFormOpen] = useState(false);

  const businessValues = [
    {
      icon: TrendingUp,
      title: "Vermindering van problemen onder personeel",
      description: "Minder conflicten en een betere werksfeer leiden tot verhoogde productiviteit en behoud van waardevolle medewerkers.",
      features: ["Minder ziekteverzuim", "Betere werksfeer", "Hoger behoud personeel"],
      gradient: "from-emerald-500/10 to-green-600/10"
    },
    {
      icon: Shield,
      title: "Sterker imago en verantwoord inkopen",
      description: "Toon actief bij te dragen aan een sociaal veilige bouwplaats. Aantrekkelijk keurmerk voor opdrachtgevers die verantwoordelijk inkopen.",
      features: ["Positief imago", "Aantrekkelijk voor opdrachtgevers", "Keurmerk zichtbaarheid"],
      gradient: "from-blue-500/10 to-indigo-600/10"
    },
    {
      icon: Building2,
      title: "Minder juridische conflicten",
      description: "Proactieve aanpak van sociale veiligheid voorkomt juridische problemen en vermindert kosten van conflictoplossing.",
      features: ["Minder rechtszaken", "Lagere kosten", "Preventieve aanpak"],
      gradient: "from-purple-500/10 to-violet-600/10"
    },
    {
      icon: Target,
      title: "Keurmerk en zichtbaarheid",
      description: "Ontvang een bordje voor op de gevel en vermelding op onze website. Laat zien dat jullie aangesloten zijn bij de beweging.",
      features: ["Gevelbordje", "Website vermelding", "Certificaat"],
      gradient: "from-orange-500/10 to-red-600/10"
    }
  ];

  const pricingTiers = [
    {
      icon: Users,
      size: "Klein",
      employees: "1-10 medewerkers",
      price: "€250",
      popular: false
    },
    {
      icon: Building2,
      size: "Middelgroot",
      employees: "11-50 medewerkers", 
      price: "€750",
      popular: true
    },
    {
      icon: Award,
      size: "Groot",
      employees: "50+ medewerkers",
      price: "€1250",
      popular: false
    }
  ];

  // Build a safe, encoded SVG background for the decoration without nesting quotes in JSX
  const backgroundSvg = `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#f97316" fill-opacity="0.03"><circle cx="30" cy="30" r="2"/></g></g></svg>`;
  const backgroundDataUrl = `url("data:image/svg+xml,${encodeURIComponent(backgroundSvg)}")`;

  return (
    <section id="actie" className="py-24 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{ backgroundImage: backgroundDataUrl, backgroundRepeat: 'repeat' }}
      ></div>
      
      <div className="container mx-auto px-4 relative">
        <div 
          ref={headerRef}
          className={`text-center mb-20 transition-all duration-1000 ${
            headerVisible 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform translate-y-8'
          }`}
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
            <Target className="w-4 h-4 mr-2" />
            Waarde voor bedrijven
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Investeer in sociale veiligheid
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            Ontdek waarom steeds meer bedrijven zich aansluiten bij onze beweging 
            en investeren in een sociaal veilige bouwplaats. Een kleine investering met grote impact.
          </p>
        </div>

        {/* Pricing Section */}
        <div 
          ref={pricingRef}
          className={`mb-20 transition-all duration-1000 ${
            pricingVisible 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-foreground">Jaarlijkse bijdrage</h3>
            <p className="text-muted-foreground">Eenvoudig via automatisch incasso met herinneringen</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={index}
                className={`relative p-8 text-center transition-all duration-500 border-2 hover:shadow-2xl hover:scale-105 ${
                  tier.popular 
                    ? 'border-primary shadow-xl bg-gradient-to-br from-primary/5 to-primary/10' 
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
                style={{ 
                  transitionDelay: pricingVisible ? `${index * 150}ms` : '0ms'
                }}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Populair
                    </span>
                  </div>
                )}
                
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                  tier.popular ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <tier.icon className={`w-8 h-8 ${tier.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                
                <h4 className="text-xl font-semibold mb-2 text-foreground">{tier.size}</h4>
                <p className="text-muted-foreground mb-6">{tier.employees}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">{tier.price}</span>
                  <span className="text-muted-foreground ml-1">/jaar</span>
                </div>
                
                <Button 
                  variant={tier.popular ? "default" : "outline"} 
                  className="w-full"
                  onClick={() => setFormOpen(true)}
                >
                  Aanmelden
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Business Values Cards */}
        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {businessValues.map((value, index) => (
            <Card 
              key={index} 
              className={`group relative p-8 transition-all duration-700 border-0 hover:shadow-2xl hover:scale-[1.02] bg-gradient-to-br ${value.gradient} backdrop-blur-sm ${
                cardsVisible 
                  ? 'opacity-100 transform translate-x-0' 
                  : 'opacity-0 transform ' + (index % 2 === 0 ? '-translate-x-12' : 'translate-x-12')
              }`}
              style={{ 
                transitionDelay: cardsVisible ? `${index * 200}ms` : '0ms'
              }}
            >
              {/* Subtle border gradient */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 p-[1px]">
                <div className="h-full w-full rounded-lg bg-card"></div>
              </div>
              
              <div className="relative flex items-start space-x-6">
                <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/30">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {value.description}
                  </p>
                  <ul className="space-y-3">
                    {value.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                        <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-primary" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            onClick={() => setFormOpen(true)}
          >
            <Euro className="w-5 h-5 mr-2" />
            Word onderdeel van de beweging
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Gevelbordje en website vermelding inbegrepen
          </p>
        </div>
      </div>
      
      <MembershipForm open={formOpen} onOpenChange={setFormOpen} />
    </section>
  );
};

export default ActionItems;
