import React, { useState } from "react";
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
  const [password, setPassword] = useState("BouwMetRespect2024!");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First try to sign in
      const {
        error: signInError
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) {
        // If login fails, try to create the account first
        if (signInError.message.includes("Invalid login credentials")) {
          console.log("Account doesn't exist, creating admin account...");
          const {
            error: signUpError
          } = await supabase.auth.signUp({
            email: "info@bouwmetrespect.nl",
            password: "BouwMetRespect2024!",
            options: {
              data: {
                first_name: 'Admin',
                last_name: 'User',
                role: 'admin'
              }
            }
          });
          if (signUpError && !signUpError.message.includes("already registered")) {
            throw signUpError;
          }

          // Now try to sign in again
          const {
            error: retrySignInError
          } = await supabase.auth.signInWithPassword({
            email: "info@bouwmetrespect.nl",
            password: "BouwMetRespect2024!"
          });
          if (retrySignInError) {
            throw retrySignInError;
          }
          toast({
            title: "Admin Account Aangemaakt",
            description: "Account aangemaakt en je bent ingelogd!",
            duration: 5000
          });
        } else {
          throw signInError;
        }
      } else {
        toast({
          title: "Ingelogd!",
          description: "Je bent succesvol ingelogd"
        });
      }

      // Check if user is admin or partner and redirect accordingly
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        // Check if user has admin role or if it's the admin email
        if (user.email === 'info@bouwmetrespect.nl') {
          navigate("/dashboard");
        } else {
          // Check if user is a partner
          const {
            data: partnerData
          } = await supabase.from('partner_memberships').select('id').eq('user_id', user.id).eq('payment_status', 'paid').single();
          if (partnerData) {
            navigate("/partner-dashboard");
          } else {
            navigate("/dashboard"); // Default to admin dashboard
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login mislukt",
        description: `Fout: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAdmin = async () => {
    setResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-admin-password', {
        body: {}
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Admin Wachtwoord Gereset",
          description: "Wachtwoord is gereset naar: BouwMetRespect2024!",
          duration: 10000
        });
        setPassword("BouwMetRespect2024!");
      } else {
        throw new Error(data?.error || 'Reset failed');
      }
    } catch (error: any) {
      console.error('Reset error:', error);
      toast({
        title: "Reset mislukt",
        description: `Fout: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setResetting(false);
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
                  disabled={resetting}
                  onClick={handleResetAdmin}
                >
                  {resetting ? "Bezig met resetten..." : "Reset Admin Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Login;