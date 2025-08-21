
import { Card } from "@/components/ui/card";
import { Target, Users, Lightbulb, Shield, Heart, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Mission = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.2);
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation(0.1);

  const helpMethods = [
    {
      icon: Shield,
      title: "Workshops & trainingen voor bedrijven",
      description: "Praktische trainingen over sociale veiligheid in de bouw en het aanpakken van grensoverschrijdend gedrag."
    },
    {
      icon: Users,
      title: "Community & steun voor jongeren", 
      description: "Een veilige plek waar jongeren in de bouw hun ervaringen delen en elkaar ondersteunen."
    },
    {
      icon: Target,
      title: "Verhalen & ervaringen delen",
      description: "Echte verhalen uit de sector die het probleem zichtbaar maken en oplossingen inspireren."
    },
    {
      icon: Lightbulb,
      title: "Tools & handvatten voor leidinggevenden",
      description: "Praktische hulpmiddelen voor HR en leidinggevenden om respect op de werkvloer te bevorderen."
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
            Hoe wij helpen
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Van praktische trainingen tot een ondersteunende community. Wij bieden concrete hulp 
            om grensoverschrijdend gedrag aan te pakken en de bouwsector aantrekkelijker te maken.
          </p>
          <p className="text-lg font-semibold text-primary">
            Samen zorgen we voor cultuurverandering op de bouwplaats.
          </p>
        </div>

        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 gap-8"
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
              <div className="w-16 h-16 mb-6 bg-primary/10 rounded-2xl flex items-center justify-center transition-all duration-300">
                <method.icon className="w-8 h-8 text-primary" />
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
