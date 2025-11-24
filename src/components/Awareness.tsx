import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const Awareness = () => {
  const {
    ref: awarenessRef,
    isVisible: awarenessVisible
  } = useScrollAnimation(0.1);
  
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const awarenessItems = [{
    image: "/lovable-uploads/af5847a3-a5b8-4469-a490-1a2dd06dd44b.png",
    title: "Herken de signalen",
    subtitle: "Grensoverschrijdend gedrag is niet altijd zichtbaar",
    description: "Leer de subtiele signalen herkennen van grensoverschrijdend gedrag op de werkplek.",
    alt: "Grensoverschrijdend gedrag herkennen op de bouwplaats - signalen en preventie"
  }, {
    image: "/lovable-uploads/0aa319ff-868a-4104-9b80-da10435fc7c7.png",
    title: "Zwakke fundatie",
    subtitle: "De fundatie van onze bouwcultuur is te zwak",
    description: "De huidige cultuur in de bouw houdt geen stand meer. Tijd voor een sterke nieuwe basis.",
    alt: "Zwakke fundatie bouwcultuur - tijd voor verandering in de bouwsector"
  }, {
    image: "/lovable-uploads/af266479-6043-45e9-8c66-dfb97bebf09b.png",
    title: "Bouw mee",
    subtitle: "Aan een respectvolle werkomgeving",
    description: "Sluit je aan bij onze beweging voor een veiligere en respectvollere bouwsector.",
    alt: "Bouw mee aan respectvolle bouwsector - word lid van de beweging"
  }];

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setGalleryOpen(true);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % awarenessItems.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + awarenessItems.length) % awarenessItems.length);
  };

  return (
    <section id="probleem" className="py-16 px-4" ref={awarenessRef}>
      <div className="container mx-auto">
        {/* Desktop Layout - 3 columns */}
        <div className="hidden xl:grid grid-cols-3 gap-8">
          {awarenessItems.map((item, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden border-0 shadow-lg cursor-pointer transition-all duration-700 ${
                awarenessVisible ? 'animate-fade-in' : 'opacity-0'
              }`} 
              style={{
                animationDelay: `${index * 200}ms`
              }}
              onClick={() => openGallery(index)}
            >
              <div className="aspect-[16/10] relative">
                <img src={item.image} alt={item.alt} className="w-full h-full object-contain" />
                
                {/* BMR Badge */}
                <div className="absolute top-3 left-3">
                  
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tablet Layout - stacked vertically */}
        <div className="hidden sm:block xl:hidden space-y-6">
          {awarenessItems.map((item, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden border-0 shadow-lg cursor-pointer transition-all duration-700 ${
                awarenessVisible ? 'animate-fade-in' : 'opacity-0'
              }`} 
              style={{
                animationDelay: `${index * 200}ms`
              }}
              onClick={() => openGallery(index)}
            >
              <div className="aspect-[16/10] relative">
                <img src={item.image} alt={item.alt} className="w-full h-full object-contain" />
                
                {/* BMR Badge */}
                <div className="absolute top-3 left-3">
                  <div className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold rounded">
                    BMR
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile Layout - no text overlay */}
        <div className="sm:hidden space-y-4">
          {awarenessItems.map((item, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden border-0 shadow-lg cursor-pointer transition-all duration-700 ${
                awarenessVisible ? 'animate-fade-in' : 'opacity-0'
              }`} 
              style={{
                animationDelay: `${index * 200}ms`
              }}
              onClick={() => openGallery(index)}
            >
              <div className="aspect-[16/10] relative">
                <img src={item.image} alt={item.alt} className="w-full h-full object-contain" />
                
                {/* BMR Badge */}
                <div className="absolute top-3 left-3">
                  <div className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold rounded">
                    BMR
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Photo Gallery Modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setGalleryOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            
            <div className="flex items-center justify-center min-h-[70vh]">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-40"
                onClick={prevImage}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              
              <img
                src={awarenessItems[selectedImageIndex].image}
                alt={awarenessItems[selectedImageIndex].alt}
                className="max-w-full max-h-[70vh] object-contain"
              />
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-40"
                onClick={nextImage}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>
            
            <div className="p-6 text-center text-white">
              <h3 className="text-xl font-semibold mb-2">
                {awarenessItems[selectedImageIndex].title}
              </h3>
              <p className="text-gray-300">
                {awarenessItems[selectedImageIndex].subtitle}
              </p>
              <div className="flex justify-center space-x-2 mt-4">
                {awarenessItems.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === selectedImageIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Awareness;