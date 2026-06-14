import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Shield, Hammer, Sparkles, CheckCircle2, Repeat, Calendar } from "lucide-react";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { useSearchParams } from "react-router-dom";

type DonationMode = "monthly" | "once";

const MONTHLY_AMOUNTS = [3, 5, 10, 25];
const ONCE_AMOUNTS = [10, 25, 50, 100, 250, 500];

const Donatie = () => {
  const [mode, setMode] = useState<DonationMode>("monthly");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(3);
  const [customAmount, setCustomAmount] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const recurring = searchParams.get("recurring") === "true";
      toast({
        title: recurring ? "Maandelijkse donatie actief!" : "Donatie voltooid!",
        description: recurring
          ? "Bedankt — vanaf nu draag je elke maand bij aan een veiligere bouw."
          : "Bedankt voor je bijdrage aan een veiligere bouwsector.",
      });
    }
  }, [searchParams, toast]);

  const handleModeChange = (value: string) => {
    const next = value as DonationMode;
    setMode(next);
    setSelectedAmount(next === "monthly" ? 3 : 25);
    setCustomAmount("");
  };

  const amounts = mode === "monthly" ? MONTHLY_AMOUNTS : ONCE_AMOUNTS;
  const minAmount = mode === "monthly" ? 3 : 5;

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) setSelectedAmount(null);
  };

  const getFinalAmount = () => {
    if (customAmount && !isNaN(Number(customAmount))) return Number(customAmount);
    return selectedAmount || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = getFinalAmount();

    if (finalAmount < minAmount) {
      toast({
        title: "Ongeldig bedrag",
        description: `Het minimum bedrag is €${minAmount}`,
        variant: "destructive",
      });
      return;
    }
    if (!formData.name || !formData.email) {
      toast({
        title: "Vul alle velden in",
        description: "Naam en e-mail zijn verplicht",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("create-donation-payment", {
        body: {
          amount: finalAmount,
          name: formData.name,
          email: formData.email,
          message: formData.message,
          isRecurring: mode === "monthly",
        },
      });
      if (error) throw error;
      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Geen betaal-URL ontvangen");
      }
    } catch (error) {
      console.error("Donation error:", error);
      toast({
        title: "Er ging iets mis",
        description: error instanceof Error ? error.message : "Probeer het later opnieuw",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const impactItems = [
    {
      icon: Shield,
      title: "Psychologische veiligheid",
      description:
        "Een bouwplaats waar iedereen zichzelf kan zijn, fouten bespreekbaar zijn en niemand zich onveilig hoeft te voelen.",
    },
    {
      icon: Hammer,
      title: "Vakmanschap doorgeven",
      description:
        "Ruimte voor leermeesters en leerlingen, zodat kennis en trots op het vak overgaan op de volgende generatie.",
    },
    {
      icon: Sparkles,
      title: "Innovatie & toekomst",
      description:
        "Een sector die durft te vernieuwen — duurzamer, slimmer en aantrekkelijker voor jong talent.",
    },
  ];

  const finalAmount = getFinalAmount();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Doneer maandelijks | Stichting Bouw met Respect"
        description="Steun de beweging vanaf €3 per maand. Investeer in een bouwplaats waar psychologische veiligheid de norm is en vakmanschap doorgegeven wordt."
        keywords="maandelijkse donatie bouw, doneren bouwsector, psychologische veiligheid bouw, vakmanschap, sociale veiligheid"
        url="https://bouwmetrespect.nl/donatie"
      />

      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bouw mee aan een veilige toekomst
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Stel je een bouwplaats voor waar psychologische veiligheid de norm is. Waar de jongste
              leerling net zo gehoord wordt als de meest ervaren vakman. Waar je met plezier naar je
              werk gaat — en met respect weer naar huis. Met jouw maandelijkse bijdrage vanaf{" "}
              <strong className="text-foreground">€3</strong> investeer je in precies die sector:
              eentje waar de volgende generatie vakmensen graag wíl werken, leren en innoveren.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Automatische maandelijkse afschrijving</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Op elk moment opzegbaar</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>100% naar de missie</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Waarin je investeert</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Elke euro draagt bij aan een bouwsector waar mens én vak centraal staan.
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
                <CardTitle className="text-2xl">Steun de beweging</CardTitle>
                <CardDescription>
                  Kies maandelijks of eenmalig. Maandelijkse donaties worden automatisch afgeschreven.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={mode} onValueChange={handleModeChange} className="mb-6">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="monthly" className="gap-2">
                      <Repeat className="w-4 h-4" />
                      Maandelijks
                    </TabsTrigger>
                    <TabsTrigger value="once" className="gap-2">
                      <Calendar className="w-4 h-4" />
                      Eenmalig
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="monthly" className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Vanaf €3 per maand. Automatische afschrijving via kaart, op elk moment opzegbaar.
                    </p>
                  </TabsContent>
                  <TabsContent value="once" className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Een eenmalige bijdrage, betaalbaar via iDEAL of kaart.
                    </p>
                  </TabsContent>
                </Tabs>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label>
                      {mode === "monthly" ? "Kies een maandbedrag" : "Kies een bedrag"}
                    </Label>
                    <div className={`grid ${mode === "monthly" ? "grid-cols-4" : "grid-cols-3"} gap-3`}>
                      {amounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={selectedAmount === amount ? "default" : "outline"}
                          onClick={() => handleAmountSelect(amount)}
                          className="h-14 text-base font-semibold"
                        >
                          €{amount}
                          {mode === "monthly" && (
                            <span className="text-xs font-normal opacity-75 ml-1">/mnd</span>
                          )}
                        </Button>
                      ))}
                    </div>

                    <div>
                      <Label htmlFor="customAmount">Of voer een ander bedrag in</Label>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        <Input
                          id="customAmount"
                          type="number"
                          min={minAmount}
                          step="1"
                          placeholder="0"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="pl-8 h-14 text-lg"
                        />
                        {mode === "monthly" && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            per maand
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="name">
                        Naam <span className="text-destructive">*</span>
                      </Label>
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
                      <Label htmlFor="email">
                        E-mailadres <span className="text-destructive">*</span>
                      </Label>
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
                      <Label htmlFor="message">Bericht</Label>
                      <Textarea
                        id="message"
                        placeholder="Laat een bericht achter..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg h-14"
                    disabled={isSubmitting || finalAmount < minAmount}
                  >
                    {isSubmitting
                      ? "Even geduld..."
                      : mode === "monthly"
                        ? `Start €${finalAmount || "..."} per maand`
                        : `Doneer €${finalAmount || "..."}`}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Je wordt doorgestuurd naar een beveiligde betaalpagina.
                    {mode === "monthly" && " Je kunt je maandelijkse donatie altijd opzeggen via e-mail."}
                  </p>
                </form>
              </CardContent>
            </Card>

            <div className="mt-8 text-center text-muted-foreground">
              <p className="mb-2">
                Stichting Bouw met Respect (KVK: 98829521) is een ANBI-stichting.
              </p>
              <p>Donaties zijn fiscaal aftrekbaar. Je ontvangt automatisch een bevestiging per e-mail.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Donatie;
