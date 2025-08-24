
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Building2, TrendingUp, Shield, ArrowRight, CheckCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const ActionItems = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.2);
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation(0.1);

  const businessValues = [
    {
      icon: TrendingUp,
      title: "Vermindering van problemen onder personeel",
      description: "Minder conflicten en een betere werksfeer leiden tot verhoogde productiviteit en behoud van waardevolle medewerkers.",
      features: ["Minder ziekteverzuim", "Betere werksfeer", "Hoger behoud personeel"]
    },
    {
      icon: Shield,
      title: "Sterker imago en verantwoord inkopen",
      description: "Toon actief bij te dragen aan een sociaal veilige bouwplaats. Aantrekkelijk keurmerk voor opdrachtgevers die verantwoordelijk inkopen.",
      features: ["Positief imago", "Aantrekkelijk voor opdrachtgevers", "Keurmerk zichtbaarheid"]
    },
    {
      icon: Building2,
      title: "Minder juridische conflicten",
      description: "Proactieve aanpak van sociale veiligheid voorkomt juridische problemen en vermindert kosten van conflictoplossing.",
      features: ["Minder rechtszaken", "Lagere kosten", "Preventieve aanpak"]
    },
    {
      icon: Target,
      title: "Keurmerk en zichtbaarheid",
      description: "Ontvang een bordje voor op de gevel en vermelding op onze website. Laat zien dat jullie aangesloten zijn bij de beweging.",
      features: ["Gevelbordje", "Website vermelding", "Certificaat"]
    }
  ];

  return (
    <section id="actie" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div 
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-1000 ${
            headerVisible 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform translate-y-8'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Waarde voor bedrijven
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Ontdek waarom steeds meer bedrijven zich aansluiten bij onze beweging 
            en investeren in een sociaal veilige bouwplaats.
          </p>
          
          {/* Pricing Information */}
          <div className="bg-muted/30 rounded-2xl p-8 max-w-4xl mx-auto mb-12">
            <h3 className="text-2xl font-semibold mb-6 text-foreground">Jaarlijkse bijdrage</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">€250</div>
                <p className="text-muted-foreground">Kleine bedrijven<br/>(1-10 medewerkers)</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">€750</div>
                <p className="text-muted-foreground">Middelgrote bedrijven<br/>(11-50 medewerkers)</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">€1250</div>
                <p className="text-muted-foreground">Grote bedrijven<br/>(50+ medewerkers)</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Via automatisch incasso met herinneringen</p>
          </div>
        </div>

        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 gap-8"
        >
          {businessValues.map((value, index) => (
            <Card 
              key={index} 
              className={`p-8 transition-all duration-700 border-0 bg-card ${
                cardsVisible 
                  ? 'opacity-100 transform translate-x-0' 
                  : 'opacity-0 transform ' + (index % 2 === 0 ? '-translate-x-12' : 'translate-x-12')
              }`}
              style={{ 
                transitionDelay: cardsVisible ? `${index * 200}ms` : '0ms'
              }}
            >
              <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{value.description}</p>
                  <ul className="space-y-2">
                    {value.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActionItems;
