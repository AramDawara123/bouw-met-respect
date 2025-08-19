import { Heart, Linkedin, Mail, Building } from "lucide-react";
const Footer = () => {
  return <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-12 mb-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Bouw met Respect</h3>
            </div>
            <p className="text-background/80 leading-relaxed max-w-md mx-auto">
              Samen bouwen we aan een betere toekomst voor de bouwsector. 
              Een werkplek waar respect, veiligheid en inclusie centraal staan.
            </p>
          </div>
          
          <div className="text-center">
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-background transition-colors">Word lid</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Events</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Verhalen</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Resources</a></li>
            </ul>
          </div>
          
          <div className="text-center">
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <a href="mailto:info@bouwmetrespect.nl" className="flex items-center justify-center space-x-2 text-background/80 hover:text-background transition-colors">
                <Mail className="w-4 h-4" />
                <span>info@bouwmetrespect.nl</span>
              </a>
              <a href="#" className="flex items-center justify-center space-x-2 text-background/80 hover:text-background transition-colors">
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-background/20">
          <div className="flex flex-col items-center space-y-4 text-center">
            <p className="text-background/60 text-sm">© 2025 Bouw met Respect. Alle rechten voorbehouden.</p>
            <p className="text-background/60 text-sm flex items-center">
              Gemaakt met <Heart className="w-4 h-4 mx-1 text-primary" /> voor een respectvolle bouwsector
            </p>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;