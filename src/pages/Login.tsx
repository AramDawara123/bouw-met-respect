import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Ingelogd!",
        description: "Je bent succesvol ingelogd",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      toast({
        title: "Account aangemaakt!",
        description: "Check je email voor verificatie",
      });
    } catch (error: any) {
      toast({
        title: "Registratie mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAdminAccount = async () => {
    setLoading(true);
    
    try {
      // First try to sign up the admin account
      const { error: signUpError } = await supabase.auth.signUp({
        email: "info@bouwmetrespect.nl",
        password: "admin123",
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (signUpError && !signUpError.message.includes("already registered")) {
        throw signUpError;
      }

      // Then try to sign in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: "info@bouwmetrespect.nl",
        password: "admin123",
      });

      if (signInError) throw signInError;

      toast({
        title: "Admin account gereed!",
        description: "Je bent ingelogd als admin",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.log("Admin account setup:", error.message);
      toast({
        title: "Account setup",
        description: "Admin account bestaat al - probeer in te loggen",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Terug naar home
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@bouwmetrespect.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Bezig..." : "Inloggen"}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSignUp}
                  disabled={loading}
                >
                  Account aanmaken
                </Button>
                <Button 
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={createAdminAccount}
                  disabled={loading}
                >
                  🚀 Admin Account Aanmaken
                </Button>
              </div>
            </form>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Admin toegang:</strong> Gebruik het email adres info@bouwmetrespect.nl om automatisch admin rechten te krijgen.
              </p>
              <p className="text-xs text-muted-foreground">
                💡 <strong>Snelle setup:</strong> Klik op "Admin Account Aanmaken" om direct een admin account te maken met wachtwoord: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;