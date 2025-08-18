
import { Heart, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-2">Bouw met Respect</h3>
            <p className="text-background/80">
              Samen bouwen we aan een betere toekomst voor de sector
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-background/60 text-sm">
              Een initiatief van professionals die geloven in verandering
            </p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <a 
              href="mailto:info@bouwmetrespect.nl" 
              className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-background/20 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-background/20 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-background/20 text-center">
          <p className="text-background/60 text-sm flex items-center justify-center">
            Gemaakt met <Heart className="w-4 h-4 mx-1 text-primary" /> voor een respectvolle bouwsector
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
