
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Star, Quote } from "lucide-react";

const Testimonial = () => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Verhalen van verandering
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ontdek hoe bedrijven en professionals samen werken aan een 
              respectvolle bouwsector.
            </p>
          </div>

          {/* Video Section */}
          <div className="mb-16">
            <div className="relative bg-muted rounded-3xl aspect-video flex items-center justify-center mb-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
              <Button size="lg" className="relative z-10 w-20 h-20 rounded-full p-0">
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-0 bg-card">
              <div className="flex justify-between items-start mb-6">
                <Quote className="w-8 h-8 text-primary" />
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <blockquote className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                "Door de 'Bouw met Respect' community hebben we een concrete verandering 
                kunnen doorvoeren op onze bouwplaatsen. Het gevoel van samenwerking en 
                veiligheid is merkbaar toegenomen."
              </blockquote>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">JB</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Jan Bakker</p>
                  <p className="text-muted-foreground">Projectleider, Bouwbedrijf Amsterdam</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-0 bg-card">
              <div className="flex justify-between items-start mb-6">
                <Quote className="w-8 h-8 text-primary" />
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <blockquote className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                "Als jonge professional voelde ik me eindelijk welkom in de bouwsector. 
                De community heeft me de tools gegeven om zelf verandering teweeg te brengen."
              </blockquote>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">MS</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Maria Silva</p>
                  <p className="text-muted-foreground">Bouwkundig ingenieur</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
