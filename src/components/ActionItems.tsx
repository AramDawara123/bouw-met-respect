
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Users, MessageSquare, Shield, ArrowRight, CheckCircle } from "lucide-react";

const ActionItems = () => {
  const actions = [
    {
      icon: Target,
      title: "Doe mee en maak een verschil",
      description: "Word onderdeel van een beweging die de bouwsector positief wil veranderen door respect en veiligheid centraal te stellen.",
      features: ["Toegang tot community", "Maandelijkse events", "Kennisdeling"]
    },
    {
      icon: Users,
      title: "Sluit je aan bij onze gemeenschap",
      description: "Verbind met gelijkgestemde professionals die ook geloven in een respectvolle en inclusieve bouwsector.",
      features: ["Netwerk mogelijkheden", "Ervaringen delen", "Samen leren"]
    },
    {
      icon: MessageSquare,
      title: "Samen werken voor een betere toekomst",
      description: "Deel ervaringen, leer van elkaar en werk samen aan concrete oplossingen voor de uitdagingen in onze sector.",
      features: ["Praktische oplossingen", "Best practices", "Workshops"]
    },
    {
      icon: Shield,
      title: "Verhalen die inspireren en verbeteren",
      description: "Ontdek inspirerende verhalen van verandering en leer hoe je zelf een positieve impact kunt maken op je werkplek.",
      features: ["Success stories", "Praktische tips", "Inspiratie"]
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Hoe kunnen we helpen?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ontdek de verschillende manieren waarop je kunt bijdragen aan een 
            respectvolle en veilige bouwsector.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {actions.map((action, index) => (
            <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-card">
              <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">{action.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{action.description}</p>
                  <ul className="space-y-2 mb-6">
                    {action.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    Meer informatie
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
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
