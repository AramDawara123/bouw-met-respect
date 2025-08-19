
import { Card } from "@/components/ui/card";
import { Target, Users, Lightbulb, Shield, Heart, Zap } from "lucide-react";

const Mission = () => {
  const values = [
    {
      icon: Shield,
      title: "Veiligheid voorop",
      description: "Een werkplek waar iedereen zich veilig en gerespecteerd voelt, zonder uitzonderingen.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      icon: Users,
      title: "Inclusieve gemeenschap", 
      description: "Ruimte voor iedereen, ongeacht achtergrond, ervaring of identiteit.",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      icon: Target,
      title: "Concrete actie",
      description: "Van bewustwording naar daadwerkelijke, meetbare verandering in de praktijk.",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      icon: Lightbulb,
      title: "Nieuw perspectief",
      description: "Jong talent behouden door een moderne, vooruitstrevende werkcultuur.",
      image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      icon: Heart,
      title: "Respect centraal",
      description: "Respectvolle omgang als basis voor alle interacties op de werkplek.",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      icon: Zap,
      title: "Positieve energie",
      description: "Enthousiasme en motivatie creëren voor een betere bouwsector.",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Onze kernwaarden
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Deze waarden vormen de basis van onze community en geven richting aan 
            alle acties die we ondernemen voor een betere bouwsector.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <Card 
              key={index} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-card group"
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={value.image} 
                  alt={value.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mission;
