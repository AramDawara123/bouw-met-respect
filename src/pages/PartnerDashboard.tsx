import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Edit, Plus, LogOut } from "lucide-react";
import CompanyProfileForm from "@/components/CompanyProfileForm";

interface PartnerMembership {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  description: string | null;
  payment_status: string;
  amount: number;
  created_at: string;
}

interface CompanyProfile {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  industry: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_featured: boolean;
  display_order: number;
  partner_membership_id: string | null;
}

const PartnerDashboard = () => {
  const [partnerMembership, setPartnerMembership] = useState<PartnerMembership | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Demo mode - allow access without authentication for testing
      if (!user) {
        console.log('No user found, enabling demo mode');
        setUser({ id: 'demo-user', email: 'demo@example.com' });
        setPartnerMembership({
          id: 'demo-partnership',
          first_name: 'Demo',
          last_name: 'Gebruiker',
          email: 'demo@example.com',
          phone: '+31 6 12345678',
          company_name: 'Demo Bedrijf BV',
          website: 'https://demo-bedrijf.nl',
          industry: 'Bouw & Constructie',
          description: 'Een demo bedrijf voor testdoeleinden',
          payment_status: 'paid',
          amount: 25000,
          created_at: new Date().toISOString()
        });
        
        // Demo company profile
        setCompanyProfile({
          id: 'demo-profile',
          name: 'Demo Bedrijf BV',
          description: 'Een vooraanstaand bouwbedrijf gespecialiseerd in duurzame constructies en renovaties. Wij leveren hoogwaardige diensten met respect voor het milieu.',
          website: 'https://demo-bedrijf.nl',
          logo_url: '/placeholder.svg',
          industry: 'Bouw & Constructie',
          contact_email: 'info@demo-bedrijf.nl',
          contact_phone: '+31 6 12345678',
          is_featured: true,
          display_order: 1,
          partner_membership_id: 'demo-partnership'
        });
        setLoading(false);
        return;
      }

      setUser(user);
      await Promise.all([fetchPartnerMembership(), fetchCompanyProfile()]);
    } catch (error) {
      console.error('Auth check error:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het laden van je gegevens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerMembership = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_memberships')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('payment_status', 'paid')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPartnerMembership(data);
    } catch (error) {
      console.error('Error fetching partner membership:', error);
    }
  };

  const fetchCompanyProfile = async () => {
    try {
      const { data: partnerData } = await supabase
        .from('partner_memberships')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('payment_status', 'paid')
        .single();

      if (!partnerData) return;

      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('partner_membership_id', partnerData.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCompanyProfile(data);
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleProfileFormSuccess = () => {
    fetchCompanyProfile();
    setShowProfileForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Login Vereist</h2>
              <p className="text-muted-foreground mb-4">
                Je moet ingelogd zijn om je partnerdashboard te bekijken.
              </p>
              <Link to="/login">
                <Button>Inloggen</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!partnerMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">Geen Actief Partnerschap</h2>
              <p className="text-muted-foreground mb-4">
                Je hebt geen actief partnerschap of je betaling is nog niet verwerkt.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/company-profiles">
                  <Button className="w-full">Word Partner</Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full">Terug naar Home</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4 lg:p-8 mt-16">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Demo Mode Banner */}
        {user?.id === 'demo-user' && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-yellow-800 font-medium">
                Demo Modus - Dit is een voorbeeld van het Partner Dashboard
              </p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Partner Dashboard</h1>
              <p className="text-muted-foreground">Beheer je bedrijfsprofiel</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Uitloggen
          </Button>
        </div>

        {/* Partnership Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Partnerschap Status</CardTitle>
              <Badge className="bg-green-100 text-green-800">
                {partnerMembership.payment_status === 'paid' ? 'Actief' : 'Pending'}
              </Badge>
            </div>
            <CardDescription>
              Welkom, {partnerMembership.first_name} {partnerMembership.last_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bedrijf</p>
                <p className="font-medium">{partnerMembership.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branche</p>
                <p className="font-medium">{partnerMembership.industry || 'Niet opgegeven'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{partnerMembership.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Partner sinds</p>
                <p className="font-medium">{new Date(partnerMembership.created_at).toLocaleDateString('nl-NL')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Profile Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bedrijfsprofiel</CardTitle>
                <CardDescription>
                  {companyProfile 
                    ? "Beheer je bedrijfsprofiel dat zichtbaar is voor bezoekers" 
                    : "Maak je bedrijfsprofiel aan om zichtbaar te zijn voor bezoekers"
                  }
                </CardDescription>
              </div>
              {companyProfile ? (
                <Button onClick={() => setShowProfileForm(true)} className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Bewerken
                </Button>
              ) : (
                <Button onClick={() => setShowProfileForm(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Profiel Aanmaken
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {companyProfile ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {companyProfile.logo_url ? (
                    <img 
                      src={companyProfile.logo_url} 
                      alt={`${companyProfile.name} logo`}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{companyProfile.name}</h3>
                    {companyProfile.industry && (
                      <Badge variant="outline" className="mb-2">{companyProfile.industry}</Badge>
                    )}
                    {companyProfile.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {companyProfile.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Link to="/company-profiles" target="_blank">
                    <Button variant="outline" size="sm">
                      Bekijk Openbaar Profiel
                    </Button>
                  </Link>
                  {companyProfile.is_featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">Uitgelicht</Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Je hebt nog geen bedrijfsprofiel aangemaakt. Maak er één aan om zichtbaar te zijn voor potentiële klanten.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {showProfileForm && (
          <CompanyProfileForm
            open={showProfileForm}
            onOpenChange={setShowProfileForm}
            onSuccess={handleProfileFormSuccess}
            editingProfile={companyProfile}
            isPartnerDashboard={true}
            partnerMembershipId={partnerMembership.id}
          />
        )}
      </div>
    </div>
  );
};

export default PartnerDashboard;