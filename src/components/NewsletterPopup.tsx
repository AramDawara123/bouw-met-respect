import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NewsletterPopup = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Don't show popup on login pages and dashboards
  const excludedPaths = ['/login', '/dashboard', '/partner-dashboard', '/partner-auth'];
  const shouldShowPopup = !excludedPaths.includes(location.pathname);

  useEffect(() => {
    // Only show popup if not on excluded paths
    if (shouldShowPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [shouldShowPopup]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Fout",
        description: "Vul een geldig e-mailadres in",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a hidden form and submit to Mailchimp
      const form = document.createElement('form');
      form.action = 'https://bouwmetrespect.us7.list-manage.com/subscribe/post';
      form.method = 'POST';
      form.target = 'mc-embedded-subscribe-frame-popup';
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

      setIsSubmitted(true);
      toast({
        title: "Gelukt!",
        description: "Je bent succesvol aangemeld voor onze nieuwsbrief",
      });
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    } catch (error: any) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible || !shouldShowPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-8">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Blijf op de hoogte!
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Ontvang maandelijks updates over onze initiatieven, events en inspirerende verhalen uit de bouwsector.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Je e-mailadres"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 text-center"
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  {isLoading ? "Aanmelden..." : "Aanmelden voor nieuwsbrief"}
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                Je kunt je op elk moment uitschrijven. We respecteren je privacy.
              </p>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Bedankt!
              </h3>
              <p className="text-gray-600">
                Je bent succesvol aangemeld voor onze nieuwsbrief.
              </p>
            </div>
          )}
        </div>
        <iframe ref={iframeRef} name="mc-embedded-subscribe-frame-popup" style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default NewsletterPopup;
