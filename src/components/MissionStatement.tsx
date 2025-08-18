
import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Users, Building } from "lucide-react";

const MissionStatement = () => {
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
          <div className="bg-muted rounded-3xl aspect-[4/3] flex items-center justify-center">
            <div className="text-center p-8">
              <Building className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Afbeelding: Positieve werksfeer</p>
            </div>
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
      </div>
    </section>
  );
};

export default MissionStatement;
