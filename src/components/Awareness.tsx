import { Card } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
const Awareness = () => {
  const {
    ref: awarenessRef,
    isVisible: awarenessVisible
  } = useScrollAnimation(0.1);
  const awarenessItems = [{
    image: "/lovable-uploads/af5847a3-a5b8-4469-a490-1a2dd06dd44b.png",
    title: "Herken de signalen",
    subtitle: "Grensoverschrijdend gedrag is niet altijd zichtbaar",
    description: "Leer de subtiele signalen herkennen van grensoverschrijdend gedrag op de werkplek."
  }, {
    image: "/lovable-uploads/0aa319ff-868a-4104-9b80-da10435fc7c7.png",
    title: "Zwakke fundatie",
    subtitle: "De fundatie van onze bouwcultuur is te zwak",
    description: "De huidige cultuur in de bouw houdt geen stand meer. Tijd voor een sterke nieuwe basis."
  }, {
    image: "/lovable-uploads/af266479-6043-45e9-8c66-dfb97bebf09b.png",
    title: "Bouw mee",
    subtitle: "Aan een respectvolle werkomgeving",
    description: "Sluit je aan bij onze beweging voor een veiligere en respectvollere bouwsector."
  }];
  return <section id="probleem" className="py-16 px-4" ref={awarenessRef}>
      <div className="container mx-auto">
        {/* Desktop and Tablet Layout */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {awarenessItems.map((item, index) => <Card key={index} className={`relative overflow-hidden border-0 shadow-lg group transition-all duration-700 ${awarenessVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{
          animationDelay: `${index * 200}ms`
        }}>
              <div className="aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] relative">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                
                {/* Improved gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* BMR Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold rounded">
                    BMR
                  </div>
                </div>
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold mb-1 text-yellow-400">
                    {item.title}
                  </h3>
                  <p className="text-base font-semibold mb-2 text-yellow-400">
                    {item.subtitle}
                  </p>
                  <p className="text-sm leading-relaxed text-white/90">
                    {item.description}
                  </p>
                </div>
                
              </div>
            </Card>)}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-6">
          {awarenessItems.map((item, index) => <Card key={index} className={`relative overflow-hidden border-0 shadow-lg group transition-all duration-700 ${awarenessVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{
          animationDelay: `${index * 200}ms`
        }}>
              <div className="aspect-[16/10] sm:aspect-[3/2] relative">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                
                {/* Improved gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* BMR Badge */}
                <div className="absolute top-3 left-3">
                  <div className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold rounded">
                    BMR
                  </div>
                </div>
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold mb-1 text-yellow-400">
                    {item.title}
                  </h3>
                  <p className="text-base font-semibold mb-2 text-yellow-400">
                    {item.subtitle}
                  </p>
                  <p className="text-sm leading-relaxed text-white/90">
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>)}
        </div>
      </div>
    </section>;
};
export default Awareness;