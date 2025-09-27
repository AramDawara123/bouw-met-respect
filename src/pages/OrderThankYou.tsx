import { useEffect } from 'react';
import { CheckCircle, Package, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const OrderThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title
    document.title = 'Bedankt voor je bestelling - Bouw met Respect';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Bedankt voor je bestelling!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Je bestelling is succesvol ontvangen en wordt verwerkt.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-2 border-dashed border-muted-foreground/20">
                <CardContent className="p-4 text-center">
                  <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-foreground mb-1">Verzending</h3>
                  <p className="text-sm text-muted-foreground">
                    Je ontvangt binnen 3-5 werkdagen een verzendbevestiging
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-dashed border-muted-foreground/20">
                <CardContent className="p-4 text-center">
                  <Mail className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-foreground mb-1">Bevestiging</h3>
                  <p className="text-sm text-muted-foreground">
                    Een orderbevestiging is naar je e-mail verstuurd
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Vragen over je bestelling?
              </h3>
              <p className="text-muted-foreground mb-4">
                Neem gerust contact met ons op. We helpen je graag verder!
              </p>
              <div className="space-y-1 text-sm">
                <p className="text-foreground font-medium">E-mail: info@bouwmetrespect.nl</p>
                <p className="text-foreground font-medium">Telefoon: +31 6 12345678</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => navigate('/webshop')} 
                variant="outline" 
                className="flex-1"
              >
                Verder winkelen
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                className="flex-1"
              >
                Terug naar homepage
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            © 2024 Bouw met Respect. Bedankt voor het vertrouwen in ons!
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderThankYou;