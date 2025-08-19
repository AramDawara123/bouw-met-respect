import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Users, Building, Plus } from "lucide-react";
import { useState } from "react";
import ImageGenerator from "./ImageGenerator";

const MissionStatement = () => {
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [missionImage, setMissionImage] = useState<string | null>(null);

  const handleImageGenerated = (imageUrl: string) => {
    setMissionImage(imageUrl);
    setShowImageGenerator(false);
  };

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Main Mission Statement */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
              Het probleem dat we samen oplossen
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Grensoverschrijdend gedrag op bouwplaatsen houdt jong talent weg uit onze sector. 
              Door samen te werken aan een cultuur van respect en veiligheid, kunnen we dit 
              probleem aanpakken en een aantrekkelijkere werkplek creëren voor iedereen.
            </p>
            <div className="flex items-center space-x-3 text-primary">
              <AlertTriangle className="w-6 h-6" />
              <span className="font-semibold">Urgente actie vereist</span>
            </div>
          </div>
          
          {/* Mission Image */}
          <div className="relative">
            {missionImage ? (
              <div className="relative rounded-3xl overflow-hidden">
                <img
                  src={missionImage}
                  alt="Probleem op bouwplaats"
                  className="w-full aspect-[4/3] object-cover"
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
              <div className="bg-muted rounded-3xl aspect-[4/3] flex items-center justify-center">
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
          </div>
        </div>

        {/* Statistics Section */}
        <Card className="p-12 bg-accent/30 border-0">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-accent-foreground">
                De cijfers spreken voor zich
              </h3>
              <p className="text-accent-foreground/80 leading-relaxed mb-8 text-lg">
                De bouwsector staat voor een grote uitdaging. Veel jonge professionals 
                verlaten de bouw binnen de eerste jaren vanwege een cultuur die zij als 
                onveilig of niet-inclusief ervaren.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">200k+</div>
                  <p className="text-accent-foreground/70">Extra bouwvakkers nodig</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">40%</div>
                  <p className="text-accent-foreground/70">Verlaat binnen 2 jaar</p>
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-3xl aspect-square flex items-center justify-center">
              <div className="text-center p-8">
                <TrendingUp className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Statistieken visualisatie</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Image Generator Modal */}
        {showImageGenerator && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-md w-full">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Genereer Missie Afbeelding</h3>
              </div>
              <div className="p-4">
                <ImageGenerator
                  onImageGenerated={handleImageGenerated}
                  defaultPrompt="Construction site with workplace harassment or bullying situation, showing the problem in construction industry, realistic, documentary style"
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
    </section>
  );
};

export default MissionStatement;
