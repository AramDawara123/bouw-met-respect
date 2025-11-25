import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Users, Shield, Award, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

const Donatie = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const suggestedAmounts = [10, 25, 50, 100, 250, 500];

  const impactItems = [
    {
      icon: Users,
      title: "Voorlichting & Training",
      description: "Met €50 kunnen we voorlichtingsmateriaal ontwikkelen voor 100 werknemers"
    },
    {
      icon: Shield,
      title: "Meldpunt & Ondersteuning",
      description: "€100 helpt ons het meldpunt een maand draaiende te houden"
    },
    {
      icon: Award,
      title: "Certificering & Erkenning",
      description: "€250 ondersteunt het certificeringsprogramma voor veilige bedrijven"
    }
  ];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(null);
    }
  };

  const getFinalAmount = () => {
    if (customAmount && !isNaN(Number(customAmount))) {
      return Number(customAmount);
    }
    return selectedAmount || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAmount = getFinalAmount();
    
    if (finalAmount < 5) {
      toast({
        title: "Ongeldig bedrag",
        description: "Het minimum donatiebedrag is €5",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name || !formData.email) {
      toast({
        title: "Vul alle velden in",
        description: "Naam en email zijn verplicht",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement Mollie payment integration here
      toast({
        title: "Bedankt voor je donatie!",
        description: `Je wordt doorgestuurd naar de betaalpagina voor €${finalAmount}`,
      });
      
      // Simulate redirect delay
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      console.error('Donation error:', error);
      toast({
        title: "Er ging iets mis",
        description: "Probeer het later opnieuw",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Doneren | Stichting Bouw met Respect"
        description="Steun onze missie voor een veiligere bouwsector. Elke donatie helpt bij het bestrijden van grensoverschrijdend gedrag en het creëren van een respectvolle werkomgeving."
        keywords="donatie bouw, steun bouwsector, veilige werkplek doneren, sociale veiligheid ondersteunen"
        url="https://bouwmetrespect.nl/donatie"
      />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Samen bouwen aan respect
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Jouw donatie maakt het verschil. Help ons de bouwsector veiliger en 
              respectvoller te maken voor iedereen.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>100% transparant</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Direct impact</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Fiscaal aftrekbaar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Waar jouw donatie voor gebruikt wordt
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Elke euro gaat direct naar het verbeteren van sociale veiligheid in de bouwsector
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {impactItems.map((item, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Doneer nu</CardTitle>
                <CardDescription>
                  Kies een bedrag of voer een aangepast bedrag in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Amount Selection */}
                  <div className="space-y-4">
                    <Label>Kies een bedrag</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {suggestedAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={selectedAmount === amount ? "default" : "outline"}
                          onClick={() => handleAmountSelect(amount)}
                          className="h-14 text-lg font-semibold"
                        >
                          €{amount}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="relative">
                      <Label htmlFor="customAmount">Of voer een ander bedrag in</Label>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          €
                        </span>
                        <Input
                          id="customAmount"
                          type="number"
                          min="5"
                          step="1"
                          placeholder="0"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="pl-8 h-14 text-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="name">Naam *</Label>
                      <Input
                        id="name"
                        placeholder="Je naam"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mailadres *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="je@email.nl"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Bericht (optioneel)</Label>
                      <Textarea
                        id="message"
                        placeholder="Laat een bericht achter..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full text-lg h-14"
                    disabled={isSubmitting || getFinalAmount() < 5}
                  >
                    {isSubmitting ? (
                      "Even geduld..."
                    ) : (
                      `Doneer €${getFinalAmount() || "..."}`
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Je wordt doorgestuurd naar een beveiligde betaalpagina
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-8 text-center text-muted-foreground">
              <p className="mb-2">
                Stichting Bouw met Respect (KVK: 98829521) is een ANBI-stichting.
              </p>
              <p>
                Donaties zijn fiscaal aftrekbaar. Je ontvangt automatisch een bevestiging per email.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Donatie;
