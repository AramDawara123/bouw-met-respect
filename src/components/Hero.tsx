
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Shield, Heart } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-90" />
      
      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-10 animate-float">
        <Shield className="w-12 h-12 text-white/20" />
      </div>
      <div className="absolute bottom-32 right-16 animate-float" style={{animationDelay: '1s'}}>
        <Users className="w-16 h-16 text-white/20" />
      </div>
      <div className="absolute top-40 right-20 animate-float" style={{animationDelay: '2s'}}>
        <Heart className="w-10 h-10 text-white/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <div className="animate-fade-in">
          <h1 className="mb-6 max-w-4xl mx-auto leading-tight">
            Bouw met <span className="bg-white/20 px-3 py-1 rounded-lg">Respect</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed font-light">
            Samen doorbreken we de cirkel van grensoverschrijdend gedrag op bouwplaatsen. 
            Voor een veilige, respectvolle sector die jong talent verwelkomt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 h-auto"
            >
              Word lid van de community
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 h-auto"
            >
              Lees ons verhaal
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-background">
          <path d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
