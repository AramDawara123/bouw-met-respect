
import { Card } from "@/components/ui/card";
import { AlertTriangle, Users } from "lucide-react";

const MissionStatement = () => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-6">
        {/* Main Mission Statement */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground leading-tight">
              Respect op de bouwplaats: 
              Samen werken aan een 
              positieve verandering
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Grensoverschrijdend gedrag op bouwplaatsen is een hardnekkig probleem dat 
              jong talent weghoudt uit onze sector. Door samen te werken aan een cultuur 
              van respect en veiligheid, kunnen we dit probleem aanpakken en een 
              aantrekkelijkere werkplek creëren voor iedereen.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <span>Urgente actie vereist</span>
            </div>
          </div>
          <div className="bg-muted rounded-2xl aspect-video flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Afbeelding: Positieve werksfeer</p>
            </div>
          </div>
        </div>

        {/* Challenge Section */}
        <Card className="p-8 md:p-12 bg-accent/50">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-accent-foreground">
                De bouwsector staat voor een grote uitdaging: een tekort aan talent
              </h3>
              <p className="text-accent-foreground leading-relaxed mb-6">
                Veel jonge professionals verlaten de bouw binnen de eerste jaren vanwege 
                een cultuur die zij als onveilig of niet-inclusief ervaren. Dit probleem 
                wordt steeds urgenter naarmate de vraag naar bouwvakkers toeneemt.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">200k+</div>
                  <p className="text-sm text-accent-foreground">Extra bouwvakkers nodig</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">40%</div>
                  <p className="text-sm text-accent-foreground">Verlaat binnen 2 jaar</p>
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-2xl aspect-square flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Statistieken visualisatie</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MissionStatement;
