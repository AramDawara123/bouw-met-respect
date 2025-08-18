
import { Card } from "@/components/ui/card";
import { Target, Users, Lightbulb, Shield } from "lucide-react";

const Mission = () => {
  const values = [
    {
      icon: Shield,
      title: "Veiligheid voorop",
      description: "Een werkplek waar iedereen zich veilig en gerespecteerd voelt"
    },
    {
      icon: Users,
      title: "Inclusieve gemeenschap", 
      description: "Ruimte voor iedereen, ongeacht achtergrond of ervaring"
    },
    {
      icon: Target,
      title: "Concrete actie",
      description: "Van bewustwording naar daadwerkelijke verandering"
    },
    {
      icon: Lightbulb,
      title: "Nieuw perspectief",
      description: "Jong talent behouden door een moderne werkcultuur"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="mb-6 text-foreground">Onze kernwaarden</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Deze waarden vormen de basis van onze community en geven richting aan 
            alle acties die we ondernemen voor een betere bouwsector.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card 
              key={index} 
              className="p-6 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <value.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{value.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mission;
