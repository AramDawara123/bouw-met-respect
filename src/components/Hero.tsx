
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Shield, Heart, Target, Building, Zap, Plus } from "lucide-react";
import { useState } from "react";
import ImageGenerator from "./ImageGenerator";

const Hero = () => {
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  const features = [
    { icon: Shield, title: "Veiligheid", description: "Een veilige werkplek voor iedereen" },
    { icon: Users, title: "Respect", description: "Respectvolle omgang op de bouwplaats" },
    { icon: Heart, title: "Inclusie", description: "Ruimte voor jong talent" },
    { icon: Target, title: "Kwaliteit", description: "Professionele werkstandaarden" },
    { icon: Building, title: "Toekomst", description: "Duurzame sector ontwikkeling" },
    { icon: Zap, title: "Verandering", description: "Concrete actie voor verbetering" }
  ];

  const handleImageGenerated = (imageUrl: string) => {
    setHeroImage(imageUrl);
    setShowImageGenerator(false);
  };

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

          {/* Hero Image */}
          <div className="relative">
            {heroImage ? (
              <div className="relative rounded-3xl overflow-hidden">
                <img
                  src={heroImage}
                  alt="Positieve bouwplaats sfeer"
                  className="w-full h-[400px] object-cover"
                />
                <Button
                  onClick={() => setShowImageGenerator(true)}
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuwe afbeelding
                </Button>
              </div>
            ) : (
              <div className="bg-muted rounded-3xl h-[400px] flex items-center justify-center">
                <div className="text-center p-8">
                  <Building className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-4">Voeg een afbeelding toe</p>
                  <Button
                    onClick={() => setShowImageGenerator(true)}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Genereer afbeelding
                  </Button>
                </div>
              </div>
            )}

            {/* Image Generator Modal */}
            {showImageGenerator && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-background rounded-lg max-w-md w-full">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Genereer Hero Afbeelding</h3>
                  </div>
                  <div className="p-4">
                    <ImageGenerator
                      onImageGenerated={handleImageGenerated}
                      defaultPrompt="Professional diverse construction workers collaborating on a modern building site, positive atmosphere, natural lighting, high quality, realistic"
                    />
                  </div>
                  <div className="p-4 border-t flex justify-end">
                    <Button
                      onClick={() => setShowImageGenerator(false)}
                      variant="outline"
                    >
                      Sluiten
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
