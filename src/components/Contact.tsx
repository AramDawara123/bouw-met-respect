
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Contact Form Section */}
        <div className="text-center mb-16">
          <h2 className="mb-6 text-foreground">Neem contact op</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Wil je meer weten over onze community of heb je vragen? 
            Neem gerust contact met ons op.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-20">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Naam *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-2">
                  Bedrijf/Organisatie
                </label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Bericht *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Vertel ons over je vragen of hoe je wilt bijdragen..."
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Verstuur bericht
              </Button>
            </form>
          </Card>
        </div>

        {/* Contact Info Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-semibold mb-8 text-foreground">Neem contact op</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">Email</h4>
            <p className="text-muted-foreground mb-2">Stuur ons een bericht</p>
            <a href="mailto:info@bouwmetrespect.nl" className="text-primary hover:underline">
              info@bouwmetrespect.nl
            </a>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">Telefoon</h4>
            <p className="text-muted-foreground mb-2">Bel ons voor directe vragen</p>
            <a href="tel:+31612345678" className="text-primary hover:underline">
              +31 6 1234 5678
            </a>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">Locatie</h4>
            <p className="text-muted-foreground mb-2">Bezoek ons kantoor</p>
            <p className="text-primary">Amsterdam, Nederland</p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;
