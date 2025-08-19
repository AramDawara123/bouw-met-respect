
import { Card } from "@/components/ui/card";
import { Target, Users, Lightbulb, Shield, Heart, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Mission = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.2);
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation(0.1);

  const values = [
    {
      icon: Shield,
      title: "Veiligheid voorop",
      description: "Een werkplek waar iedereen zich veilig en gerespecteerd voelt, zonder uitzonderingen."
    },
    {
      icon: Users,
      title: "Inclusieve gemeenschap", 
      description: "Ruimte voor iedereen, ongeacht achtergrond, ervaring of identiteit."
    },
    {
      icon: Target,
      title: "Concrete actie",
      description: "Van bewustwording naar daadwerkelijke, meetbare verandering in de praktijk."
    },
    {
      icon: Lightbulb,
      title: "Nieuw perspectief",
      description: "Jong talent behouden door een moderne, vooruitstrevende werkcultuur."
    },
    {
      icon: Heart,
      title: "Respect centraal",
      description: "Respectvolle omgang als basis voor alle interacties op de werkplek."
    },
    {
      icon: Zap,
      title: "Positieve energie",
      description: "Enthousiasme en motivatie creëren voor een betere bouwsector."
    }
  ];

  return (
    <section className="py-20 bg-muted/20">
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
            Onze kernwaarden
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Deze waarden vormen de basis van onze community en geven richting aan 
            alle acties die we ondernemen voor een betere bouwsector.
          </p>
        </div>

        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {values.map((value, index) => (
            <Card 
              key={index} 
              className={`p-8 text-center transition-all duration-500 border-0 bg-card ${
                cardsVisible 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-12'
              }`}
              style={{ 
                transitionDelay: cardsVisible ? `${index * 150}ms` : '0ms'
              }}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center transition-all duration-300">
                <value.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{value.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mission;
