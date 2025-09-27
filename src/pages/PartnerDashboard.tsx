import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, LogOut, Settings, User as UserIcon } from "lucide-react";
import CompanyProfileManager from "@/components/company-profile/CompanyProfileManager";
import PartnerAccountSettings from "@/components/PartnerAccountSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Session } from '@supabase/supabase-js';

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

const PartnerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [partnerMembership, setPartnerMembership] = useState<PartnerMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user logs out or is not authenticated, redirect to partner auth
        if (!session?.user) {
          navigate('/partner-auth');
          return;
        }
        
        // Fetch data when user is authenticated
        if (session?.user && !partnerMembership) {
          setTimeout(() => {
            fetchPartnerData(session.user);
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/partner-auth');
        setLoading(false);
        return;
      }
      
      fetchPartnerData(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate, partnerMembership]);

  const fetchPartnerData = async (user: User) => {
    try {
      await fetchPartnerMembership(user.id);
    } catch (error) {
      console.error('Error fetching partner data:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het laden van je gegevens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerMembership = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('partner_memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('payment_status', 'paid')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching partner membership:', error);
        return;
      }

      setPartnerMembership(data);
    } catch (error) {
      console.error('Error fetching partner membership:', error);
    }
  };

  const handleRefreshData = async () => {
    if (user) {
      await fetchPartnerData(user);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/partner-auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het uitloggen",
        variant: "destructive"
      });
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

  if (!user || !session) {
    return null; // Auth redirect is handled in useEffect
  }

  if (!partnerMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">Geen Actief Partnerschap</h2>
              <p className="text-muted-foreground mb-6">
                Je hebt geen actief partnerschap of je betaling is nog niet verwerkt.
                Neem contact op met ons om je partnerschap te activeren.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/">
                  <Button className="w-full">Terug naar Home</Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  Uitloggen
                </Button>
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
              <p className="text-muted-foreground">Welkom, {partnerMembership.first_name}!</p>
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

        {/* Dashboard Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Bedrijfsprofiel
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Account Instellingen
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <CompanyProfileManager
              partnerMembershipId={partnerMembership.id}
              isPartnerDashboard={true}
              showCreateButton={true}
              showDeleteButton={false}
            />
          </TabsContent>
          
          <TabsContent value="account">
            <PartnerAccountSettings
              partnerMembership={partnerMembership}
              user={user}
              onUpdate={handleRefreshData}
            />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default PartnerDashboard;