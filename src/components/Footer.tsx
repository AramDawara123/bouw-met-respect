import { Heart, Linkedin, Mail, Building, ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Fout",
        description: "Vul een geldig e-mailadres in",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);

    try {
      // Create a hidden form and submit to Mailchimp
      const form = document.createElement('form');
      form.action = 'https://bouwmetrespect.us7.list-manage.com/subscribe/post';
      form.method = 'POST';
      form.target = 'mc-embedded-subscribe-frame';
      form.style.display = 'none';

      // Add form fields
      const fields = {
        'u': 'ae557f93e4f6e90f421f82d95',
        'id': 'a1e71ed8be',
        'f_id': '00beeae3f0',
        'EMAIL': email,
        'b_ae557f93e4f6e90f421f82d95_a1e71ed8be': '' // honeypot
      };

      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      // Show success message
      toast({
        title: "Gelukt!",
        description: "Je bent succesvol aangemeld voor onze nieuwsbrief"
      });
      setEmail("");
    } catch (error: any) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
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
              <h3 className="text-3xl font-bold">Stichting Bouw met Respect</h3>
            </div>
            <p className="text-background/80 leading-relaxed text-lg mb-8 max-w-lg lg:max-w-none">
              Samen bouwen we aan een betere toekomst voor de bouwsector. 
              Een werkplek waar respect, veiligheid en inclusie centraal staan.
            </p>
          </div>
          
          {/* Community Section */}
          <div className="text-center lg:text-left">
            <h4 className="font-bold text-xl mb-6 flex items-center justify-center lg:justify-start">
              
              Community
            </h4>
            <ul className="space-y-4 text-background/80">
              <li>
                <a href="#" className="hover:text-background transition-colors flex items-center justify-center lg:justify-start group">
                  
                  Word lid
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors flex items-center justify-center lg:justify-start group">
                  
                  Events
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors flex items-center justify-center lg:justify-start group">
                  
                  Verhalen
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors flex items-center justify-center lg:justify-start group">
                  
                  Resources
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Section */}
          <div className="text-center lg:text-left">
            <h4 className="font-bold text-xl mb-6">
              Contact
            </h4>
            <div className="space-y-4">
              <div className="text-background/80">
                <div className="font-medium">Email ons</div>
                <a href="mailto:info@bouwmetrespect.nl" className="text-sm opacity-80 hover:opacity-100 transition-opacity">info@bouwmetrespect.nl</a>
              </div>
              
              <div className="text-background/80">
                <div className="font-medium">Volg ons</div>
                <div className="text-sm opacity-80">LinkedIn</div>
              </div>
            </div>
          </div>
          
          {/* Newsletter Section */}
          <div className="text-center lg:text-left">
            <h4 className="font-bold text-xl mb-6 flex items-center justify-center lg:justify-start">
              
              Nieuwsbrief
            </h4>
            <p className="text-background/70 mb-6 text-sm leading-relaxed">
              Ontvang maandelijks updates over onze initiatieven, events en inspirerende verhalen uit de bouwsector.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input type="email" placeholder="Je e-mailadres" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} className="w-full px-4 py-3 rounded-lg bg-background/10 text-background border border-background/20 placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50" />
              <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {isLoading ? "Aanmelden..." : "Aanmelden"}
              </button>
            </form>
            <iframe ref={iframeRef} name="mc-embedded-subscribe-frame" style={{ display: 'none' }} />
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
              © 2025 Stichting Bouw met Respect. Alle rechten voorbehouden.
            </p>
            <p className="text-background/60 text-sm mb-2">
              KVK: 98829521
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