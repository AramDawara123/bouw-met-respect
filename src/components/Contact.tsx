
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReportForm from "./ReportForm";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send email notification
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: `Contact formulier van ${formData.company}`,
          message: formData.message
        }
      });

      if (error || data?.error) {
        console.error('Email sending error:', error || data?.error);
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het versturen van je bericht. Probeer het opnieuw.",
          variant: "destructive",
        });
        return;
      }

      // Success
      toast({
        title: "Bericht verzonden!",
        description: "Je bericht is succesvol verzonden. We nemen zo snel mogelijk contact met je op.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        message: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Neem contact op
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Heb je vragen over sociale veiligheid in de bouw of wil je direct aansluiten 
            bij onze community? We horen graag van je. Samen maken we de bouwsector 
            aantrekkelijker en veiliger voor iedereen.
          </p>
          
          {/* Meldpunt Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setReportFormOpen(true)}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Meld grensoverschrijdend gedrag
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="p-8 border-0 bg-card">
            <h3 className="text-2xl font-semibold mb-6 text-foreground">Stuur ons een bericht</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                    Naam <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-2 text-foreground">
                  Bedrijf/Organisatie <span className="text-destructive">*</span>
                </label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                  Bericht <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Vertel ons over je vragen over grensoverschrijdend gedrag, sociale veiligheid, of hoe je wilt bijdragen aan cultuurverandering in de bouw..."
                  className="resize-none"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? "Versturen..." : "Verstuur bericht"}
              </Button>
            </form>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-foreground">Kom in contact</h3>
              <p className="text-lg text-muted-foreground mb-8">
                Wil je direct starten met het aanpakken van grensoverschrijdend gedrag op jouw 
                bouwplaats? Of heb je vragen over hoe we de bouwsector aantrekkelijker kunnen 
                maken voor jong talent? Neem gerust contact op.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="p-6 border-0 bg-muted/30">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Email</h4>
                    <a href="mailto:info@bouwmetrespect.nl" className="text-primary hover:underline">
                      info@bouwmetrespect.nl
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-0 bg-muted/30">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Telefoon</h4>
                    <a href="tel:+31612345678" className="text-primary hover:underline">
                      +31 6 1234 5678
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-0 bg-muted/30">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Locatie</h4>
                    <p className="text-muted-foreground">Amsterdam, Nederland</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <ReportForm open={reportFormOpen} onOpenChange={setReportFormOpen} />
    </section>
  );
};

export default Contact;
