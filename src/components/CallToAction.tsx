
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Heart, Building2 } from "lucide-react";
import { useState } from "react";
import MembershipForm from "./MembershipForm";

const CallToAction = () => {
  const [isMembershipFormOpen, setIsMembershipFormOpen] = useState(false);

  return (
    <>
      <section className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/30 rounded-full"></div>
              <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white/30 rounded-full"></div>
              <div className="absolute bottom-10 left-1/3 w-12 h-12 border-2 border-white/30 rounded-full"></div>
              <div className="absolute bottom-32 right-10 w-24 h-24 border-2 border-white/30 rounded-full"></div>
            </div>

            <div className="relative z-10 p-12 lg:p-20 text-center">
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <Heart className="w-8 h-8 text-white/80" />
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Klaar om je aan te sluiten bij de beweging?
              </h2>
              
              <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
                Word onderdeel van de beweging die grensoverschrijdend gedrag aanpakt. 
                Samen zorgen we voor een veilige, aantrekkelijke en toekomstbestendige 
                bouwsector waar jong talent wil blijven.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-lg px-8 py-4 bg-white text-primary"
                  onClick={() => setIsMembershipFormOpen(true)}
                >
                  Sluit je bedrijf aan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">Keurmerk</div>
                  <p className="text-sm opacity-80">Zichtbaar op gevel en website</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">Coaching</div>
                  <p className="text-sm opacity-80">Professionele begeleiding</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">Netwerk</div>
                  <p className="text-sm opacity-80">Bijeenkomsten en kennisdeling</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <MembershipForm 
        open={isMembershipFormOpen} 
        onOpenChange={setIsMembershipFormOpen} 
      />
    </>
  );
};

export default CallToAction;
