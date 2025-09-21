
import { Card } from "@/components/ui/card";
import { MessageSquareWarning, Users, Lightbulb, Shield, Award, Calendar } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Mission = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.2);
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation(0.1);

  const helpMethods = [
    {
      icon: MessageSquareWarning,
      title: "Anoniem meldpunt",
      description: "Een veilige plek waar je anoniem je verhaal kunt delen. Bij ernstige of herhaalde meldingen nemen wij contact op met het betreffende bedrijf."
    },
    {
      icon: Users,
      title: "Coaching via 3e partijen", 
      description: "Professionele coaching voor slachtoffers, daders en bedrijven. Van individuele trajecten tot groepstrainingen over sociale veiligheid."
    },
    {
      icon: Lightbulb,
      title: "Op maat gemaakte toolbox",
      description: "We ondersteunen werkgevers bij het maken van een bedrijfsspecifieke toolbox of bieden een algemene toolbox met gedragsregels voor de bouw."
    },
    {
      icon: Award,
      title: "Keurmerk Bouw met Respect",
      description: "Bedrijven die zich aansluiten tonen aan dat ze niet alleen slachtoffers beschermen, maar ook daders begeleiden - zonder direct ontslag."
    },
    {
      icon: Shield,
      title: "Stappenplan HR-traject",
      description: "Gestructureerde aanpak: melding → gesprek → coaching → evaluatie. Met jaarlijkse audit van trainingen en afgeronde trajecten."
    },
    {
      icon: Calendar,
      title: "Netwerkbijeenkomsten",
      description: "2-3 keer per jaar organiseren we bijeenkomsten waar leden elkaar kunnen ontmoeten en inspirerende sprekers aan het woord komen."
    }
  ];

  return (
    <section id="hoe-wij-helpen" className="py-20 bg-background">
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
            Hoe onze beweging helpt
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Van anonieme melding tot keurmerk. Wij bieden concrete hulp 
            om grensoverschrijdend gedrag aan te pakken en de bouwsector veiliger te maken.
          </p>
          <p className="text-lg font-semibold text-primary">
            Samen zorgen we voor cultuurverandering op de bouwplaats.
          </p>
        </div>

        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {helpMethods.map((method, index) => (
            <Card 
              key={index} 
              className={`p-8 transition-all duration-500 border-0 bg-muted/30 ${
                cardsVisible 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-12'
              }`}
              style={{ 
                transitionDelay: cardsVisible ? `${index * 150}ms` : '0ms'
              }}
            >
              <div className="w-16 h-16 mb-6 bg-blue-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-blue-600 shadow-lg">
                <method.icon className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">{method.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{method.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mission;
