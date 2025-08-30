import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Send, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportForm = ({ open, onOpenChange }: ReportFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    incident: '',
    experience: '',
    allowSharing: false,
    anonymous: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Report submitted:', formData);
    
    toast({
      title: "Melding ontvangen",
      description: "Bedankt voor het delen van je ervaring. We nemen dit serieus en komen zo spoedig mogelijk bij je terug.",
    });
    
    onOpenChange(false);
    setFormData({
      name: '',
      email: '',
      company: '',
      incident: '',
      experience: '',
      allowSharing: false,
      anonymous: false
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            Meldpunt: Deel je ervaring
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            Heb je grensoverschrijdend gedrag meegemaakt op de bouwplaats? Deel je ervaring anoniem 
            of openlijk. Samen brengen we de problemen aan het licht en werken we aan een veiligere bouwsector.
          </p>
        </DialogHeader>

        <Card className="p-6 border-0 bg-muted/20">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Veilig en vertrouwelijk</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Je melding wordt vertrouwelijk behandeld. Je bepaalt zelf of je verhaal anoniem gedeeld 
            mag worden om bewustzijn te creëren en anderen te helpen.
          </p>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Persoonlijke informatie */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contactinformatie</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Naam <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Je volledige naam"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="je.naam@email.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2">
                Bedrijf/Project (optioneel)
              </label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Naam van het bedrijf of project"
              />
            </div>
          </div>

          {/* Incident details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wat is er gebeurd?</h3>
            <div>
              <label htmlFor="incident" className="block text-sm font-medium mb-2">
                Type incident <span className="text-destructive">*</span>
              </label>
              <Input
                id="incident"
                name="incident"
                value={formData.incident}
                onChange={handleChange}
                required
                placeholder="Bijv: Pesten, discriminatie, seksuele intimidatie, agressie..."
              />
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium mb-2">
                Beschrijf je ervaring <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="experience"
                name="experience"
                rows={6}
                value={formData.experience}
                onChange={handleChange}
                required
                placeholder="Deel je verhaal... Wat is er gebeurd? Hoe voelde je je? Wat was de impact? (Minimaal 100 karakters)"
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimaal 100 karakters - Huidige lengte: {formData.experience.length}
              </p>
            </div>
          </div>

          {/* Toestemmingen */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Toestemming voor delen</h3>
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="allowSharing"
                  checked={formData.allowSharing}
                  onCheckedChange={(checked) => handleCheckboxChange('allowSharing', checked as boolean)}
                />
                <div className="space-y-1">
                  <label htmlFor="allowSharing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Ik geef toestemming om mijn verhaal te delen op sociale media en andere platforms
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Dit helpt om bewustzijn te creëren en anderen te ondersteunen die vergelijkbare ervaringen hebben
                  </p>
                </div>
              </div>

              {formData.allowSharing && (
                <div className="flex items-start space-x-3 ml-6">
                  <Checkbox
                    id="anonymous"
                    checked={formData.anonymous}
                    onCheckedChange={(checked) => handleCheckboxChange('anonymous', checked as boolean)}
                  />
                  <div className="space-y-1">
                    <label htmlFor="anonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Deel mijn verhaal anoniem (zonder naam en bedrijfsnaam)
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Je verhaal wordt gedeeld zonder identificeerbare informatie
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={formData.experience.length < 100}
          >
            <Send className="w-5 h-5 mr-2" />
            Verstuur melding
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;