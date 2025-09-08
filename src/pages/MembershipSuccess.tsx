import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Mail, Users } from "lucide-react";

const MembershipSuccess = () => {
  const [searchParams] = useSearchParams();
  const [membershipId, setMembershipId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('membership');
    if (id) {
      setMembershipId(id);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-2 border-primary/20">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Betaling Succesvol!
          </CardTitle>
          <p className="text-xl text-muted-foreground">
            Welkom bij Bouw met Respect
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
              <Users className="w-6 h-6 mr-3 text-primary" />
              Je lidmaatschap is actief
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Je betaling is succesvol verwerkt en je lidmaatschap van Bouw met Respect is nu actief. 
              Je bent nu onderdeel van een groeiende community die werkt aan een respectvolle bouwsector.
            </p>
            {membershipId && (
              <div className="mt-4 p-3 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Lidmaatschap ID:</strong> {membershipId}
                </p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-2xl p-6 border border-secondary/20">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
              <Mail className="w-6 h-6 mr-3 text-secondary" />
              Wat gebeurt er nu?
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Je ontvangt binnen 24 uur een welkomstmail met alle details</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Toegang tot exclusieve events en netwerk mogelijkheden</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Maandelijkse nieuwsbrief met praktische tips en verhalen</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Toegang tot het kwaliteitsmerk en certificering</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1 h-12" size="lg">
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Terug naar website
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 h-12" size="lg">
              <Link to="/webshop">
                <Users className="w-5 h-5 mr-2" />
                Bekijk merchandise
              </Link>
            </Button>
          </div>

          <div className="text-center pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Heb je vragen? Neem contact op via{" "}
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

export default MembershipSuccess;