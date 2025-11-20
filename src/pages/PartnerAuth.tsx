import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Building2, Mail, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from '@supabase/supabase-js';
import { z } from "zod";

// Input validation schemas
const emailSchema = z.string().email("Ongeldig email adres").max(255, "Email is te lang");
const passwordSchema = z.string().min(8, "Wachtwoord moet minimaal 8 karakters bevatten");
const nameSchema = z.string().min(2, "Minimaal 2 karakters").max(100, "Maximaal 100 karakters");
const PartnerAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: ""
  });
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    company_name: ""
  });
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Redirect to partner dashboard if authenticated
      if (session?.user) {
        navigate('/partner-dashboard');
      }
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
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
    setValidationErrors({});

    // Validate input
    try {
      emailSchema.parse(signInForm.email.trim());
      passwordSchema.parse(signInForm.password);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors: {[key: string]: string} = {};
        validationError.errors.forEach((err) => {
          if (err.path[0]) errors[err.path[0] as string] = err.message;
        });
        setValidationErrors(errors);
        setError("Controleer de invoervelden");
        setSignInLoading(false);
        return;
      }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInForm.email.trim(),
        password: signInForm.password
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Ongeldig email adres of wachtwoord. Controleer je gegevens en probeer opnieuw.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Email adres nog niet bevestigd. Controleer je inbox voor de bevestigingsmail.");
        } else if (error.message.includes("too many requests")) {
          setError("Te veel inlogpogingen. Wacht even en probeer het opnieuw.");
        } else {
          setError(error.message);
        }
        return;
      }

      toast({
        title: "Succesvol ingelogd",
        description: "Welkom terug bij je partner dashboard!",
        duration: 3000
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setError("Er ging iets mis bij het inloggen. Probeer het later opnieuw.");
    } finally {
      setSignInLoading(false);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    setError("");
    setValidationErrors({});

    // Validate all inputs
    try {
      emailSchema.parse(signUpForm.email.trim());
      nameSchema.parse(signUpForm.first_name.trim());
      nameSchema.parse(signUpForm.last_name.trim());
      if (signUpForm.company_name) {
        nameSchema.parse(signUpForm.company_name.trim());
      }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors: {[key: string]: string} = {};
        validationError.errors.forEach((err) => {
          if (err.path[0]) errors[err.path[0] as string] = err.message;
        });
        setValidationErrors(errors);
        setError("Controleer de invoervelden");
        setSignUpLoading(false);
        return;
      }
    }

    if (!signUpForm.first_name.trim() || !signUpForm.last_name.trim()) {
      setError("Voornaam en achternaam zijn verplicht");
      setSignUpLoading(false);
      return;
    }

    try {
      // Create partner account with auto-generated password
      const { data, error: functionError } = await supabase.functions.invoke('create-auto-account', {
        body: {
          email: signUpForm.email.trim(),
          first_name: signUpForm.first_name.trim(),
          last_name: signUpForm.last_name.trim(),
          company_name: signUpForm.company_name.trim()
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Partner account aangemaakt!",
        description: `Inloggegevens zijn verzonden naar ${signUpForm.email}. Controleer je inbox en spam folder.`,
        duration: 8000
      });

      // Clear form
      setSignUpForm({
        email: "",
        first_name: "",
        last_name: "",
        company_name: ""
      });

    } catch (error: any) {
      if (error.message.includes("User already registered") || error.message.includes("already exists")) {
        setError("Email adres is al geregistreerd. Probeer in te loggen of gebruik het wachtwoord reset formulier.");
      } else {
        setError(error.message || "Er ging iets mis bij het registreren");
      }
    } finally {
      setSignUpLoading(false);
    }
  };
  const handlePasswordReset = async (email?: string) => {
    const emailToReset = email || resetEmail;
    if (!emailToReset.trim()) {
      setError("Voer een email adres in");
      return;
    }

    // Validate email
    try {
      emailSchema.parse(emailToReset.trim());
    } catch (validationError) {
      setError("Voer een geldig email adres in");
      return;
    }

    setResetLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.functions.invoke('reset-partner-password', {
        body: { email: emailToReset.trim() }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      toast({
        title: "Nieuw wachtwoord verzonden!",
        description: `Een nieuw wachtwoord is gegenereerd en verzonden naar ${emailToReset}. Controleer je inbox.`,
        duration: 8000
      });
      setResetEmail("");
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || "Er ging iets mis bij het genereren van een nieuw wachtwoord");
    } finally {
      setResetLoading(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
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
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
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

              {error && <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>}

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-800">Veilige en beveiligde inlogomgeving</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email *</Label>
                    <Input 
                      id="signin-email" 
                      type="email" 
                      placeholder="partner@bedrijf.nl" 
                      value={signInForm.email} 
                      onChange={e => {
                        setSignInForm({ ...signInForm, email: e.target.value });
                        setValidationErrors({});
                      }}
                      className={validationErrors.email ? "border-red-500" : ""}
                      required 
                      autoComplete="email"
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Wachtwoord *</Label>
                    <div className="relative">
                      <Input 
                        id="signin-password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={signInForm.password} 
                        onChange={e => {
                          setSignInForm({ ...signInForm, password: e.target.value });
                          setValidationErrors({});
                        }}
                        className={validationErrors.password ? "border-red-500" : ""}
                        required 
                        autoComplete="current-password"
                        minLength={8}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.password}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={signInLoading}>
                    {signInLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Inloggen...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Veilig Inloggen
                      </>
                    )}
                  </Button>
                </form>
                
                {/* Password Reset Section */}
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="text-center mb-3">
                    <p className="text-sm font-medium text-muted-foreground">Wachtwoord vergeten?</p>
                    <p className="text-xs text-muted-foreground mt-1">We genereren automatisch een nieuw veilig wachtwoord en sturen dit naar je email</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="sr-only">Email voor wachtwoord reset</Label>
                    <Input 
                      id="reset-email"
                      type="email" 
                      placeholder="Voer je email adres in" 
                      value={resetEmail} 
                      onChange={e => setResetEmail(e.target.value)}
                      autoComplete="email"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handlePasswordReset()} 
                      disabled={resetLoading || !resetEmail.trim()}
                    >
                      {resetLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Nieuw wachtwoord genereren...
                        </>
                      ) : (
                        "Nieuw wachtwoord genereren"
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800">Automatische en veilige account aanmaak</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-first-name">Voornaam *</Label>
                      <Input
                        id="signup-first-name"
                        type="text"
                        placeholder="Jan"
                        value={signUpForm.first_name}
                        onChange={(e) => {
                          setSignUpForm({...signUpForm, first_name: e.target.value});
                          setValidationErrors({});
                        }}
                        className={validationErrors.first_name ? "border-red-500" : ""}
                        required
                        autoComplete="given-name"
                        maxLength={100}
                      />
                      {validationErrors.first_name && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.first_name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-last-name">Achternaam *</Label>
                      <Input
                        id="signup-last-name"
                        type="text"
                        placeholder="Jansen"
                        value={signUpForm.last_name}
                        onChange={(e) => {
                          setSignUpForm({...signUpForm, last_name: e.target.value});
                          setValidationErrors({});
                        }}
                        className={validationErrors.last_name ? "border-red-500" : ""}
                        required
                        autoComplete="family-name"
                        maxLength={100}
                      />
                      {validationErrors.last_name && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.last_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Adres *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="partner@bedrijf.nl"
                        className={`pl-10 ${validationErrors.email ? "border-red-500" : ""}`}
                        value={signUpForm.email}
                        onChange={(e) => {
                          setSignUpForm({...signUpForm, email: e.target.value});
                          setValidationErrors({});
                        }}
                        required
                        autoComplete="email"
                        maxLength={255}
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-company">Bedrijfsnaam</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-company"
                        type="text"
                        placeholder="Bouwbedrijf BV"
                        className={`pl-10 ${validationErrors.company_name ? "border-red-500" : ""}`}
                        value={signUpForm.company_name}
                        onChange={(e) => {
                          setSignUpForm({...signUpForm, company_name: e.target.value});
                          setValidationErrors({});
                        }}
                        autoComplete="organization"
                        maxLength={100}
                      />
                    </div>
                    {validationErrors.company_name && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.company_name}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      Automatisch veilig account proces:
                    </h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>✓ Veilig wachtwoord wordt automatisch gegenereerd</li>
                      <li>✓ Partner account wordt direct aangemaakt</li>
                      <li>✓ Email met inloggegevens wordt verzonden</li>
                      <li>✓ Direct inloggen mogelijk na email ontvangst</li>
                      <li>✓ Je gegevens zijn volledig beveiligd</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full" disabled={signUpLoading}>
                    {signUpLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Account aanmaken...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Veilig Account Aanmaken & Email Versturen
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <p>Veilige en beveiligde verbinding</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Hulp nodig met inloggen?</p>
            <p className="mt-1">Neem contact op via <a href="mailto:info@bouwmetrespect.nl" className="text-primary hover:underline">info@bouwmetrespect.nl</a></p>
          </div>
        </div>
      </div>
    </div>;
};
export default PartnerAuth;