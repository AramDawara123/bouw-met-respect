
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Shield, Heart, Hammer, HardHat, Building } from "lucide-react";

const Hero = () => {
  const concepts = [
    { icon: Shield, title: "Veiligheid", description: "Een veilige werkplek voor iedereen" },
    { icon: Users, title: "Respect", description: "Respectvolle omgang op de bouwplaats" },
    { icon: Heart, title: "Inclusie", description: "Ruimte voor jong talent" },
    { icon: Hammer, title: "Kwaliteit", description: "Professionele werkstandaarden" },
    { icon: HardHat, title: "Veilig werken", description: "Bescherming en bewustwording" },
    { icon: Building, title: "Toekomst", description: "Duurzame sector ontwikkeling" }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="mb-6 text-foreground">
            Bouw met respect:
            <br />
            Samen voor een betere toekomst
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Ontdek hoe we samen de bouwsector kunnen transformeren door respect, 
            veiligheid en inclusie centraal te stellen. Een betere werkplek begint bij bewustwording.
          </p>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Start nu
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Concepts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {concepts.map((concept, index) => (
            <Card key={index} className="p-8 text-center hover:shadow-md transition-shadow bg-muted/30">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <concept.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{concept.title}</h3>
              <p className="text-muted-foreground">{concept.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
