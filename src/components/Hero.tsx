
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

  const features = [{
    icon: Shield,
    title: "Respect & gelijkwaardigheid",
    description: "Iedereen verdient een respectvolle werkplek"
  }, {
    icon: Users,
    title: "Kracht van samenwerking",
    description: "Samen bouwen we aan cultuurverandering"
  }, {
    icon: Heart,
    title: "Ruimte voor jong talent",
    description: "De bouw aantrekkelijk maken voor nieuwe generaties"
  }, {
    icon: Target,
    title: "Sociale veiligheid",
    description: "Veilige werkplekken voor iedereen"
  }, {
    icon: Building,
    title: "Toekomstbestendige sector",
    description: "Een bouwsector die klaar is voor morgen"
  }, {
    icon: Zap,
    title: "Cultuurverandering bouwplaats",
    description: "Van harde cultuur naar respectvolle omgang"
  }];

  return (
    <>
      <section className="pt-32 pb-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div ref={heroRef} className={`grid lg:grid-cols-2 gap-12 items-center mb-16 transition-all duration-1000 ${heroVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className={`transition-all duration-1000 delay-200 ${heroVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-8'}`}>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
                Bouw met Respect – Samen maken we de bouw veiliger en menselijker
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Grensoverschrijdend gedrag en een harde cultuur houden jong talent weg uit de bouw. 
                Wij geloven dat verandering begint met respect. Sluit je aan en help mee de sector 
                aantrekkelijker te maken voor iedereen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-3" onClick={() => setIsMembershipFormOpen(true)}>
                  Sluit je aan bij de community
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Hero Image - Single Clean Layout */}
            <div className={`transition-all duration-1000 delay-400 ${heroVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'}`}>
              <div className="relative">
                <img src="/lovable-uploads/b490bd1a-4422-4f83-8394-d7a2f6d940b9.png" alt="Vrouwelijke bouwvakker draagt houten planken" className="w-full h-[500px] object-cover rounded-2xl shadow-lg" />
              </div>
            </div>
          </div>

          {/* Features Grid - Onze kernwaarden */}
          <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => <Card key={index} className={`p-8 text-center transition-all duration-500 border-0 bg-muted/30 ${featuresVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`} style={{
            transitionDelay: featuresVisible ? `${index * 100}ms` : '0ms'
          }}>
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>)}
          </div>
        </div>
      </section>

      <MembershipForm 
        open={isMembershipFormOpen} 
        onOpenChange={setIsMembershipFormOpen} 
      />
    </>
  );
};
export default Hero;
