import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from '@supabase/supabase-js';

const PartnerAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [signInForm, setSignInForm] = useState({
    email: "",
    password: ""
  });

  const [signUpForm, setSignUpForm] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect to partner dashboard if authenticated
        if (session?.user) {
          navigate('/partner-dashboard');
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/partner-dashboard');
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInForm.email,
        password: signInForm.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Ongeldig email adres of wachtwoord");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Email adres nog niet bevestigd. Controleer je inbox.");
        } else {
          setError(error.message);
        }
        return;
      }

      toast({
        title: "Succesvol ingelogd",
        description: "Welkom terug!"
      });

    } catch (error: any) {
      setError("Er ging iets mis bij het inloggen");
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    setError("");

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError("Wachtwoorden komen niet overeen");
      setSignUpLoading(false);
      return;
    }

    if (signUpForm.password.length < 6) {
      setError("Wachtwoord moet minimaal 6 karakters lang zijn");
      setSignUpLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/partner-dashboard`;
      
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.getUser();
      
      if (!existingUser.user) {
        // Try to sign up the user first
        const { error: signUpError } = await supabase.auth.signUp({
          email: signUpForm.email,
          password: signUpForm.password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        // Ignore "User already registered" error as we'll handle it below
        if (signUpError && !signUpError.message.includes("User already registered")) {
          setError(signUpError.message);
          return;
        }
      }

      // Always send our custom confirmation email
      const emailResponse = await supabase.functions.invoke('send-confirmation-email', {
        body: { email: signUpForm.email }
      });

      if (emailResponse.error) {
        console.error('Error sending confirmation email:', emailResponse.error);
        setError("Kon bevestigingsmail niet verzenden. Probeer het opnieuw.");
        return;
      }

      toast({
        title: "Registratie succesvol",
        description: "Controleer je email voor de bevestigingslink"
      });

      // Clear form
      setSignUpForm({
        email: "",
        password: "",
        confirmPassword: ""
      });

    } catch (error: any) {
      setError("Er ging iets mis bij het registreren");
    } finally {
      setSignUpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold">Partner Portal</h1>
          </div>
          <p className="text-muted-foreground">
            Log in om toegang te krijgen tot je partner dashboard
          </p>
        </div>

        {/* Back to home link */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Terug naar home
          </Link>
        </div>

        {/* Auth Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center">Partner Toegang</CardTitle>
            <CardDescription className="text-center">
              Kies hoe je wilt inloggen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Inloggen
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Registreren
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="partner@bedrijf.nl"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm({...signInForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Wachtwoord</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signInForm.password}
                        onChange={(e) => setSignInForm({...signInForm, password: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={signInLoading}
                  >
                    {signInLoading ? "Inloggen..." : "Inloggen"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="partner@bedrijf.nl"
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm({...signUpForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Wachtwoord</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm({...signUpForm, password: e.target.value})}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Bevestig Wachtwoord</Label>
                    <Input
                      id="signup-confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signUpForm.confirmPassword}
                      onChange={(e) => setSignUpForm({...signUpForm, confirmPassword: e.target.value})}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={signUpLoading}
                  >
                    {signUpLoading ? "Registreren..." : "Registreren"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Heb je problemen met inloggen?</p>
          <p>Neem contact op via info@bouwmetrespect.nl</p>
        </div>
      </div>
    </div>
  );
};

export default PartnerAuth;