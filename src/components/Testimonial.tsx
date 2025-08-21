
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Star, Quote } from "lucide-react";

const Testimonial = () => {
  return (
    <section id="verhalen" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Verhalen van verandering
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Mensen uit de bouw delen hun verhaal. Zo maken we grensoverschrijdend gedrag 
              zichtbaar en tonen we dat cultuurverandering op de bouwplaats mogelijk is. 
              Ontdek hoe respect op de werkvloer echt verschil maakt.
            </p>
          </div>

          {/* YouTube Video Section */}
          <div className="mb-16">
            <div className="relative rounded-3xl aspect-video overflow-hidden">
              <iframe 
                className="w-full h-full" 
                src="https://www.youtube.com/embed/TxRJdl2vfZU" 
                title="Bouw met Respect - Verhalen van verandering uit de bouwsector" 
                frameBorder="0" 
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
