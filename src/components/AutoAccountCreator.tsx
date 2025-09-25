import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Mail, User, Building2, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AutoAccountForm {
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
}

interface CreatedAccount {
  email: string;
  password: string;
  user_id: string;
  email_sent: boolean;
}

const AutoAccountCreator = () => {
  const [form, setForm] = useState<AutoAccountForm>({
    email: "",
    first_name: "",
    last_name: "",
    company_name: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<CreatedAccount | null>(null);
  const { toast } = useToast();

  const handleConfirmUser = async (email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('confirm-user', {
        body: { email }
      });

      if (error) {
        setError(error.message || 'Er ging iets mis bij het bevestigen van de gebruiker');
        return;
      }

      toast({
        title: "Gebruiker bevestigd!",
        description: `Email bevestigd voor ${email}`,
      });
    } catch (error: any) {
      console.error('Error confirming user:', error);
      setError(error.message || 'Er ging iets mis bij het bevestigen van de gebruiker');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('create-auto-account', {
        body: form
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSuccess(data);
      
      toast({
        title: "Account aangemaakt!",
        description: `Inloggegevens zijn verzonden naar ${form.email}`,
      });

      // Reset form
      setForm({
        email: "",
        first_name: "",
        last_name: "",
        company_name: ""
      });

    } catch (error: any) {
      setError(error.message || "Er ging iets mis");
      toast({
        title: "Fout bij aanmaken account",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-green-700">Account Succesvol Aangemaakt!</CardTitle>
          <CardDescription>
            Het account is aangemaakt en de inloggegevens zijn verzonden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Account Details:</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Email:</span> {success.email}</p>
              <p><span className="font-medium">Wachtwoord:</span> <code className="bg-gray-100 px-1 rounded">{success.password}</code></p>
              <p><span className="font-medium">User ID:</span> {success.user_id}</p>
              <p><span className="font-medium">Email verzonden:</span> {success.email_sent ? "✅ Ja" : "❌ Nee"}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>Let op:</strong> Bewaar deze gegevens veilig. De klant heeft deze ook via email ontvangen 
              {success.email_sent ? "" : " (email verzending is mislukt)"}.
            </p>
          </div>

          <Button 
            onClick={() => setSuccess(null)} 
            className="w-full"
            variant="outline"
          >
            Nieuw Account Aanmaken
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-6 h-6" />
          Automatisch Partner Account Aanmaken
        </CardTitle>
        <CardDescription>
          Maak een nieuw partner account aan en verstuur automatisch de inloggegevens via email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Voornaam</Label>
              <Input
                id="first_name"
                type="text"
                placeholder="Jan"
                value={form.first_name}
                onChange={(e) => setForm({...form, first_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Achternaam</Label>
              <Input
                id="last_name"
                type="text"
                placeholder="Jansen"
                value={form.last_name}
                onChange={(e) => setForm({...form, last_name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Adres *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="partner@bedrijf.nl"
                className="pl-10"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Bedrijfsnaam</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="company_name"
                type="text"
                placeholder="Bouwbedrijf BV"
                className="pl-10"
                value={form.company_name}
                onChange={(e) => setForm({...form, company_name: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Dit gebeurt automatisch:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Veilig wachtwoord wordt gegenereerd</li>
              <li>• Partner account wordt aangemaakt</li>
              <li>• Email met inloggegevens wordt verzonden naar klant</li>
              <li>• Account wordt toegevoegd aan je dashboard</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || !form.email}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Account Aanmaken...
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Account Aanmaken & Email Versturen
              </>
            )}
          </Button>
          
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Noodknop:</strong> Als een gebruiker niet kan inloggen vanwege email bevestiging:
            </p>
            <Button 
              type="button"
              variant="outline"
              onClick={() => form.email && handleConfirmUser(form.email)}
              disabled={loading || !form.email}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Bevestigen...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Handmatig Email Bevestigen
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AutoAccountCreator;