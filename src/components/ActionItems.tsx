
import { Card } from "@/components/ui/card";
import { Target, Users, MessageSquare, Shield, ArrowRight } from "lucide-react";

const ActionItems = () => {
  const actions = [
    {
      icon: Target,
      title: "Doe mee en maak een verschil",
      description: "Word onderdeel van een beweging die de bouwsector positief wil veranderen door respect en veiligheid centraal te stellen."
    },
    {
      icon: Users,
      title: "Sluit je aan bij onze gemeenschap",
      description: "Verbind met gelijkgestemde professionals die ook geloven in een respectvolle en inclusieve bouwsector."
    },
    {
      icon: MessageSquare,
      title: "Samen werken voor een betere toekomst",
      description: "Deel ervaringen, leer van elkaar en werk samen aan concrete oplossingen voor de uitdagingen in onze sector."
    },
    {
      icon: Shield,
      title: "Verhalen die inspireren en verbeteren",
      description: "Ontdek inspirerende verhalen van verandering en leer hoe je zelf een positieve impact kunt maken op je werkplek."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {actions.map((action, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">{action.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">{action.description}</p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Meer informatie <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
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
