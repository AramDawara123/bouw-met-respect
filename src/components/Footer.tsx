import { Heart, Linkedin, Mail, Building, ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
const Footer = () => {
  return <footer className="bg-foreground text-background py-20">
      <div className="container mx-auto px-4">
        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Building className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-3xl font-bold">Bouw met Respect</h3>
            </div>
            <p className="text-background/80 leading-relaxed text-lg mb-8 max-w-lg lg:max-w-none">
              Samen bouwen we aan een betere toekomst voor de bouwsector. 
              Een werkplek waar respect, veiligheid en inclusie centraal staan.
            </p>
          </div>
          
          {/* Community Section */}
          <div className="text-center lg:text-left">
            <h4 className="font-bold text-xl mb-6 flex items-center justify-center lg:justify-start">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 hidden lg:block"></div>
              Community
            </h4>
            <ul className="space-y-4 text-background/80">
              <li>
                <a href="#" className="hover:text-background transition-colors flex items-center justify-center lg:justify-start group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block" />
                  Word lid
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors flex items-center justify-center lg:justify-start group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block" />
                  Events
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors flex items-center justify-center lg:justify-start group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block" />
                  Verhalen
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors flex items-center justify-center lg:justify-start group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block" />
                  Resources
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Section */}
          <div className="text-center lg:text-left">
            <h4 className="font-bold text-xl mb-6 flex items-center justify-center lg:justify-start">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 hidden lg:block"></div>
              Contact
            </h4>
            <div className="space-y-4">
              <a href="mailto:info@bouwmetrespect.nl" className="flex items-center justify-center lg:justify-start space-x-3 text-background/80 hover:text-background transition-all duration-300 p-3 rounded-lg hover:bg-background/5">
                <div className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-center lg:text-left">
                  <div className="font-medium">Email ons</div>
                  <div className="text-sm opacity-80">info@bouwmetrespect.nl</div>
                </div>
              </a>
              
              <a href="#" className="flex items-center justify-center lg:justify-start space-x-3 text-background/80 hover:text-background transition-all duration-300 p-3 rounded-lg hover:bg-background/5">
                <div className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div className="text-center lg:text-left">
                  <div className="font-medium">Volg ons</div>
                  <div className="text-sm opacity-80">LinkedIn</div>
                </div>
              </a>
            </div>
          </div>
          
          {/* Newsletter Section */}
          <div className="text-center lg:text-left">
            <h4 className="font-bold text-xl mb-6 flex items-center justify-center lg:justify-start">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 hidden lg:block"></div>
              Nieuwsbrief
            </h4>
            <p className="text-background/70 mb-6 text-sm leading-relaxed">
              Ontvang maandelijks updates over onze initiatieven, events en inspirerende verhalen uit de bouwsector.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Je e-mailadres"
                className="w-full px-4 py-3 rounded-lg bg-background/10 text-background border border-background/20 placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              <button className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Aanmelden
              </button>
            </div>
            <p className="text-background/50 text-xs mt-3">
              Je kunt je op elk moment uitschrijven. We respecteren je privacy.
            </p>
          </div>
        </div>
        
        {/* Decorative Separator */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-background/20"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-foreground px-6 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 text-center md:text-left">
          <div>
            <p className="text-background/60 text-sm mb-2">
              © 2025 Bouw met Respect. Alle rechten voorbehouden.
            </p>
            
            <p className="text-background/60 text-sm text-center md:text-left">
              Gemaakt door <a href="https://dawaraconsulting.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors font-medium">Dawara Consulting</a>
            </p>
          </div>
          
          <div className="flex items-center justify-center md:justify-end space-x-6 text-background/60 text-sm">
            
            <Link to="/algemene-voorwaarden" className="hover:text-background transition-colors">Algemeene Voorwaarden</Link>
            
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;