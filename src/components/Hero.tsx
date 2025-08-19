
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Shield, Heart, Target, Building, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Hero = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation(0.2);
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollAnimation(0.1);

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
        <div 
          ref={heroRef}
          className={`grid lg:grid-cols-2 gap-12 items-center mb-16 transition-all duration-1000 ${
            heroVisible 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform translate-y-8'
          }`}
        >
          <div className={`transition-all duration-1000 delay-200 ${
            heroVisible 
              ? 'opacity-100 transform translate-x-0' 
              : 'opacity-0 transform -translate-x-8'
          }`}>
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

          {/* Hero Image - Single Clean Layout */}
          <div className={`transition-all duration-1000 delay-400 ${
            heroVisible 
              ? 'opacity-100 transform translate-x-0' 
              : 'opacity-0 transform translate-x-8'
          }`}>
            <div className="relative">
              <img
                src="/lovable-uploads/b490bd1a-4422-4f83-8394-d7a2f6d940b9.png"
                alt="Vrouwelijke bouwvakker draagt houten planken"
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div 
          ref={featuresRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`p-8 text-center transition-all duration-500 border-0 bg-muted/30 ${
                featuresVisible 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-8'
              }`}
              style={{ 
                transitionDelay: featuresVisible ? `${index * 100}ms` : '0ms'
              }}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center transition-transform duration-300">
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
