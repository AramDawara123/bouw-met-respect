import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Shield, Heart, Target, Building, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState } from "react";
import MembershipForm from "./MembershipForm";

const Hero = () => {
  const [isMembershipFormOpen, setIsMembershipFormOpen] = useState(false);
  
  const {
    ref: heroRef,
    isVisible: heroVisible
  } = useScrollAnimation(0.2);
  
  const {
    ref: featuresRef,
    isVisible: featuresVisible
  } = useScrollAnimation(0.1);

  const features = [
    {
      icon: Shield,
      title: "Respect & gelijkwaardigheid",
      description: "Iedereen verdient een respectvolle werkplek"
    },
    {
      icon: Users,
      title: "Kracht van de beweging",
      description: "Samen bouwen we aan cultuurverandering"
    },
    {
      icon: Heart,
      title: "Ruimte voor jong talent",
      description: "De bouw aantrekkelijk maken voor nieuwe generaties"
    },
    {
      icon: Target,
      title: "Sociale veiligheid",
      description: "Veilige werkplekken voor iedereen"
    },
    {
      icon: Building,
      title: "Toekomstbestendige sector",
      description: "Een bouwsector die klaar is voor morgen"
    },
    {
      icon: Zap,
      title: "Cultuurverandering bouwplaats",
      description: "Van harde cultuur naar respectvolle omgang"
    }
  ];

  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 lg:mt-16">
        {/* Background Image - Responsive */}
        <div className="absolute inset-0">
          {/* Desktop Background */}
          <div 
            className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/lovable-uploads/73f1d5f7-784d-4f62-afe1-8e5ebef9771f.png)' }}
          ></div>
          {/* Mobile Background */}
          <div 
            className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/lovable-uploads/a1441b5c-4e80-4aa5-9535-e2d1a585a97d.png)' }}
          ></div>
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-indigo-900/80"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 container mx-auto px-4">
          <div 
            ref={heroRef} 
            className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
              heroVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
            }`}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-white leading-tight">
              Bouw met Respect
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              De beweging voor een veiligere en respectvolle bouwsector. Sluit je aan en help mee 
              de sector aantrekkelijker maken voor iedereen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0" 
                onClick={() => setIsMembershipFormOpen(true)}
              >
                Sluit je aan bij de beweging
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Onze kernwaarden */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`p-6 md:p-8 text-center transition-all duration-500 border-0 bg-muted/30 ${
                  featuresVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                }`} 
                style={{
                  transitionDelay: featuresVisible ? `${index * 100}ms` : '0ms'
                }}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 bg-accent/20 rounded-2xl flex items-center justify-center transition-transform duration-300 hover:bg-accent/30">
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <MembershipForm open={isMembershipFormOpen} onOpenChange={setIsMembershipFormOpen} />
    </>
  );
};

export default Hero;