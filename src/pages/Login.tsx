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
  const [password, setPassword] = useState("admin123456");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First try to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        // If login fails, try to create the account first
        if (signInError.message.includes("Invalid login credentials")) {
          console.log("Account doesn't exist, creating admin account...");
          
          const { error: signUpError } = await supabase.auth.signUp({
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

          if (signUpError && !signUpError.message.includes("already registered")) {
            throw signUpError;
          }

          // Now try to sign in again
          const { error: retrySignInError } = await supabase.auth.signInWithPassword({
            email: "info@bouwmetrespect.nl",
            password: "admin123456"
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

      // Try to sign in immediately after creating the account
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: "info@bouwmetrespect.nl",
        password: "admin123456"
      });

      if (signInError) {
        toast({
          title: "Admin Account Aangemaakt",
          description: "Account aangemaakt maar kon niet automatisch inloggen. Probeer handmatig in te loggen.",
          duration: 10000
        });
        setPassword('admin123456');
      } else {
        toast({
          title: "Admin Account Aangemaakt",
          description: "Account aangemaakt en je bent ingelogd!",
          duration: 5000
        });
        navigate("/dashboard");
      }
      
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

  const testAdminLogin = async () => {
    setTestingLogin(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "info@bouwmetrespect.nl",
        password: "admin123456"
      });

      if (error) {
        toast({
          title: "Test Login Mislukt",
          description: `Account bestaat niet of wachtwoord klopt niet: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Test Login Succesvol",
          description: "Admin account werkt! Je wordt doorgestuurd naar dashboard.",
          duration: 3000
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Test Login Fout",
        description: `Onverwachte fout: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setTestingLogin(false);
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
            <CardTitle className="text-2xl text-center">Inloggen</CardTitle>
            <CardDescription className="text-center">
              Log in als admin of partner
            </CardDescription>
            <div className="text-sm text-muted-foreground text-center mt-2 p-3 bg-muted/50 rounded-lg">
              <strong>Admin toegang:</strong> Email en wachtwoord zijn al ingevuld.
              <br />
              <strong>Email:</strong> info@bouwmetrespect.nl
              <br />
              <strong>Wachtwoord:</strong> admin123456
            </div>
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
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
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

                <Button 
                  type="button" 
                  variant="secondary" 
                  className="w-full" 
                  onClick={testAdminLogin}
                  disabled={testingLogin}
                >
                  {testingLogin ? "Testen..." : "Test Admin Login"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;