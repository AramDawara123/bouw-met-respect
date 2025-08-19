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
              Ontdek hoe bedrijven en professionals samen werken aan een 
              respectvolle bouwsector.
            </p>
          </div>

          {/* Video Section with Real Video */}
          <div className="mb-16">
            <div className="relative rounded-3xl aspect-video overflow-hidden">
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="https://videos.pexels.com/video-files/3205549/3205549-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                <source src="https://videos.pexels.com/video-files/3205549/3205549-hd_1920_1080_25fps.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-all duration-300"></div>
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
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Jan Bakker"
                  className="w-12 h-12 rounded-full object-cover"
                />
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
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b047?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Maria Silva"
                  className="w-12 h-12 rounded-full object-cover"
                />
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
