import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
const Login = () => {
  const [email, setEmail] = useState("info@bouwmetrespect.nl");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        // If login fails, try to create admin account if it's the admin email
        if (email === 'info@bouwmetrespect.nl') {
          toast({
            title: "Account niet gevonden",
            description: "Admin account bestaat niet. Klik op 'Admin Account Aanmaken' om er een te maken.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }
      toast({
        title: "Ingelogd!",
        description: "Je bent succesvol ingelogd"
      });
      // Check if user is admin or partner and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user has admin role or if it's the admin email
        if (user.email === 'info@bouwmetrespect.nl') {
          navigate("/dashboard");
        } else {
          // Check if user is a partner
          const { data: partnerData } = await supabase
            .from('partner_memberships')
            .select('id')
            .eq('user_id', user.id)
            .eq('payment_status', 'paid')
            .single();
          
          if (partnerData) {
            navigate("/partner-dashboard");
          } else {
            navigate("/dashboard"); // Default to admin dashboard
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Login mislukt",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      if (error) throw error;
      toast({
        title: "Account aangemaakt!",
        description: "Check je email voor verificatie"
      });
    } catch (error: any) {
      toast({
        title: "Registratie mislukt",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const createAdminAccount = async () => {
    setCreatingAdmin(true);
    try {
      // First try to sign up the admin account
      const { data, error } = await supabase.auth.signUp({
        email: "info@bouwmetrespect.nl",
        password: "admin123456",
        options: {
          data: {
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin'
          }
        }
      });

      if (error && !error.message.includes("already registered")) {
        throw error;
      }

      toast({
        title: "Admin Account Aangemaakt",
        description: "Admin account is aangemaakt. Email: info@bouwmetrespect.nl, Wachtwoord: admin123456",
        duration: 10000
      });

      // Auto-fill the form
      setPassword('admin123456');
      
    } catch (error: any) {
      console.error('Error creating admin account:', error);
      toast({
        title: "Fout",
        description: `Kon admin account niet aanmaken: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setCreatingAdmin(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Terug naar home
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Inloggen</CardTitle>
            <CardDescription className="text-center">
              Log in als admin of partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="info@bouwmetrespect.nl" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Bezig..." : "Inloggen"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={createAdminAccount}
                  disabled={creatingAdmin}
                >
                  {creatingAdmin ? "Aanmaken..." : "Admin Account Aanmaken"}
                </Button>
              </div>
            </form>
            
            
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Login;