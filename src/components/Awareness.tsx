import { Card } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Awareness = () => {
  const { ref: awarenessRef, isVisible: awarenessVisible } = useScrollAnimation(0.1);

  const awarenessItems = [
    {
      image: "/lovable-uploads/af5847a3-a5b8-4469-a490-1a2dd06dd44b.png",
      title: "Herken de signalen",
      subtitle: "Grensoverschrijdend gedrag is niet altijd zichtbaar",
      description: "Leer de subtiele signalen herkennen van grensoverschrijdend gedrag op de werkplek."
    },
    {
      image: "/lovable-uploads/0aa319ff-868a-4104-9b80-da10435fc7c7.png", 
      title: "Zwakke fundatie",
      subtitle: "De fundatie van onze bouwcultuur is te zwak",
      description: "De huidige cultuur in de bouw houdt geen stand meer. Tijd voor een sterke nieuwe basis."
    },
    {
      image: "/lovable-uploads/af266479-6043-45e9-8c66-dfb97bebf09b.png",
      title: "Bouw mee",
      subtitle: "Aan een respectvolle werkomgeving",
      description: "Sluit je aan bij onze beweging voor een veiligere en respectvollere bouwsector."
    }
  ];

  return (
    <section className="py-20 bg-muted/10">
      <div className="container mx-auto px-4">
        <div ref={awarenessRef} className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${awarenessVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Bewustwording & Erkenning
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Cultuurverandering begint met bewustwording. Herken de signalen, 
              versterk de fundatie en bouw mee aan een respectvolle werkomgeving.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {awarenessItems.map((item, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-700 border-0 bg-transparent ${
                  awarenessVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                }`}
                style={{
                  transitionDelay: awarenessVisible ? `${index * 200}ms` : '0ms'
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.subtitle}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Yellow text overlay */}
                  <div className="absolute top-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-2 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-yellow-300 text-sm font-medium italic">
                      {item.subtitle}
                    </p>
                  </div>
                  
                  {/* Bottom content */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Logo/Badge in bottom right */}
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-yellow-400 text-black px-3 py-1 rounded font-bold text-sm">
                      BMR
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Awareness;