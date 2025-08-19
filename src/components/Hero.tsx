
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Shield, Heart, Target, Building, Zap } from "lucide-react";

const Hero = () => {
  const features = [
    { icon: Shield, title: "Veiligheid", description: "Een veilige werkplek voor iedereen" },
    { icon: Users, title: "Respect", description: "Respectvolle omgang op de bouwplaats" },
    { icon: Heart, title: "Inclusie", description: "Ruimte voor jong talent" },
    { icon: Target, title: "Kwaliteit", description: "Professionele werkstandaarden" },
    { icon: Building, title: "Toekomst", description: "Duurzame sector ontwikkeling" },
    { icon: Zap, title: "Verandering", description: "Concrete actie voor verbetering" }
  ];

  return (
    <section className="pt-32 pb-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
              Bouw met respect
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Samen bouwen we aan een betere toekomst voor de bouwsector. 
              Een werkplek waar respect, veiligheid en inclusie centraal staan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-3">
                Word lid van onze community
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Meer informatie
              </Button>
            </div>
          </div>

          {/* Hero Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="/lovable-uploads/370194bf-f017-421b-ab19-49ae1435a82e.png"
                alt="Vrouwelijke bouwvakker met hout"
                className="w-full h-48 object-cover rounded-2xl"
              />
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Bouwvakkers in veiligheidskleding"
                className="w-full h-32 object-cover rounded-2xl"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Diverse bouwvakkers werken samen"
                className="w-full h-32 object-cover rounded-2xl"
              />
              <img
                src="https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Vrouwelijke bouwvakker op bouwplaats"
                className="w-full h-48 object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 text-center hover:shadow-lg transition-all duration-300 border-0 bg-muted/30">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
