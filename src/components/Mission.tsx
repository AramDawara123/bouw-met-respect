
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
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="mb-6 text-foreground">Onze Missie</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            De bouwsector heeft jong talent harder nodig dan ooit. Maar grensoverschrijdend gedrag 
            houdt te veel mensen weg. Het is tijd om die cirkel te doorbreken en een nieuwe cultuur 
            van respect en professionaliteit op te bouwen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card 
              key={index} 
              className="p-6 text-center hover:shadow-lg transition-all duration-300 animate-slide-up card-gradient border-0"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <value.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{value.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-accent/50 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl font-semibold mb-4 text-accent-foreground">Het probleem is echt</h3>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">40%</div>
              <p className="text-accent-foreground">van jong talent verlaat de bouw binnen 2 jaar</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">78%</div>
              <p className="text-accent-foreground">ervaart ongepaste cultuur op de werkvloer</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">200k</div>
              <p className="text-accent-foreground">extra bouwvakkers nodig tot 2030</p>
            </div>
          </div>
          <p className="text-accent-foreground italic">
            "De oplossing ligt in onze handen. Samen kunnen we een verschil maken."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Mission;
