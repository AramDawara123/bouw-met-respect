
import { Card } from "@/components/ui/card";
import { Play, Star } from "lucide-react";

const Testimonial = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Video Section */}
          <div className="mb-12">
            <div className="relative bg-muted rounded-2xl aspect-video flex items-center justify-center mb-8">
              <button className="w-20 h-20 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </button>
            </div>
          </div>

          {/* Testimonial */}
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl font-medium text-foreground mb-6 leading-relaxed">
              "Door de 'Bouw met Respect' community hebben we een concrete verandering 
              kunnen doorvoeren op onze bouwplaatsen. Het gevoel van samenwerking en 
              veiligheid is merkbaar toegenomen."
            </blockquote>
            <div className="text-muted-foreground">
              <p className="font-semibold">Jan Bakker</p>
              <p>Projectleider, Bouwbedrijf Amsterdam</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
