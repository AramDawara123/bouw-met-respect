import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const PartnershipSuccess = () => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/partner-dashboard';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-green-700">
            Welkom als Partner!
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Je betaling is succesvol verwerkt en je partnerschap is nu actief
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Wat gebeurt er nu?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <p>Je krijgt toegang tot je persoonlijke partnerdashboard</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <p>Je kunt je bedrijfsprofiel aanmaken en beheren</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <p>Je bedrijf wordt zichtbaar in onze partnersgalerij</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <p>Je ontvangt een bevestigingsmail met je logingegevens</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              Je wordt automatisch doorgestuurd naar je dashboard in {countdown} seconden
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/partner-dashboard" className="flex-1">
              <Button className="w-full" size="lg">
                Ga naar Dashboard
              </Button>
            </Link>
            <Link to="/company-profiles" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                Bekijk Partnersgalerij
              </Button>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Heb je vragen? Neem contact met ons op via{" "}
              <a href="mailto:info@bouwmetrespect.nl" className="text-primary hover:underline">
                info@bouwmetrespect.nl
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnershipSuccess;