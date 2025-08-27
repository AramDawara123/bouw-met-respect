
import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingUp } from "lucide-react";

const MissionStatement = () => {
  return (
    <section id="probleem" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Main Mission Statement */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
              Het probleem dat we als beweging oplossen
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Grensoverschrijdend gedrag en een harde cultuur maken de bouwsector onveilig. 
              Jongeren haken af door negatieve ervaringen op de bouwplaats. Sociale veiligheid 
              in de bouw is niet meer een luxe – het is noodzaak.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              <strong>Als we niets doen, verliezen we waardevolle mensen en de toekomst van de bouw.</strong>
            </p>
            <div className="flex items-center space-x-3 text-primary">
              <AlertTriangle className="w-6 h-6" />
              <span className="font-semibold">Cultuurverandering op de bouwplaats is urgent</span>
            </div>
          </div>
          
          {/* Clean Single Image Layout */}
          <div className="flex justify-center">
            <img src="/lovable-uploads/132795ea-2daa-4305-a106-02650a9bf06c.png" alt="Bouwprofessionals in overleg op de bouwplaats" className="w-full max-w-md aspect-square object-cover rounded-2xl shadow-lg" />
          </div>
        </div>

        {/* Statistics Section */}
        <Card className="p-12 bg-accent/30 border-0 relative overflow-hidden">
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-accent-foreground">
                De cijfers spreken voor zich
              </h3>
              <p className="text-accent-foreground/80 leading-relaxed mb-8 text-lg">
                De Nederlandse bouwsector verliest jaarlijks duizenden jonge professionals. 
                Grensoverschrijdend gedrag in de bouw en gebrek aan respect op de werkvloer 
                zijn de hoofdoorzaken. Dit moet veranderen.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">40%</div>
                  <p className="text-accent-foreground/70">Jongeren verlaat de bouw binnen 2 jaar</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">200k+</div>
                  <p className="text-accent-foreground/70">Extra bouwvakkers nodig tot 2030</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Jonge bouwvakkers aan het werk" className="w-full max-w-md aspect-square object-cover rounded-2xl shadow-lg" />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MissionStatement;
