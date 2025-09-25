import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, Key, Mail, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AutoAccountCreator from "./AutoAccountCreator";

interface PartnerMembership {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  website?: string;
  industry?: string;
  description?: string;
  logo_url?: string;
  mollie_payment_id?: string;
  payment_status: string;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

const PartnerAccountManagementClean = () => {
  const [partners, setPartners] = useState<PartnerMembership[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const { toast } = useToast();

  const filteredPartners = partners.filter(partner =>
    partner.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchPartners();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAdminLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin access:', error);
        setAdminLoading(false);
        return;
      }

      setIsAdmin(profile?.is_admin === true || profile?.role === 'admin');
    } catch (error) {
      console.error('Error in checkAdminAccess:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_memberships')
        .select('*')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast({
        title: "Fout",
        description: "Kon partners niet laden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (partner: PartnerMembership) => {
    try {
      // Generate a simple password
      const password = `${partner.first_name}${Math.floor(Math.random() * 1000)}`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: partner.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/partner-dashboard`
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Account aanmaken mislukt');
      }

      // Update partner membership with user_id
      const { error: updateError } = await supabase.from('partner_memberships')
        .update({ user_id: authData.user.id })
        .eq('id', partner.id);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Account aangemaakt",
        description: `Account voor ${partner.first_name} ${partner.last_name} is aangemaakt. Wachtwoord: ${password}`
      });

      fetchPartners();
    } catch (error: any) {
      toast({
        title: "Fout bij aanmaken account",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Partner Account Beheer</CardTitle>
          <CardDescription>
            Alleen beheerders kunnen partner accounts beheren
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <div className="mb-4">🔒</div>
            <p>Je hebt geen toegang tot deze functie.</p>
            <p className="text-sm mt-2">Log in als <strong>info@bouwmetrespect.nl</strong> voor toegang.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Partner Account Beheer</h2>
        <p className="text-muted-foreground">Beheer accounts voor partners die hebben betaald</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="partners" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="partners">Partners Overzicht</TabsTrigger>
          <TabsTrigger value="auto-create" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Auto Account
          </TabsTrigger>
        </TabsList>

        {/* Partners Overview Tab */}
        <TabsContent value="partners" className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Zoek partners..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-9" 
            />
          </div>

          {/* Partners Table */}
          <Card>
            <CardHeader>
              <CardTitle>Partners ({filteredPartners.length})</CardTitle>
              <CardDescription>
                Overzicht van partners die hebben betaald en hun account status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Naam</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Bedrijf</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">
                          {partner.first_name} {partner.last_name}
                        </TableCell>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>{partner.company_name}</TableCell>
                        <TableCell>
                          <Badge variant={partner.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {partner.payment_status === 'paid' ? 'Betaald' : 'Niet betaald'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {partner.user_id ? (
                            <Badge variant="default">
                              <Key className="w-3 h-3 mr-1" />
                              Account
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Geen Account</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!partner.user_id && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleCreateAccount(partner)}
                                className="flex items-center gap-2"
                              >
                                <UserPlus className="w-4 h-4" />
                                Account
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPartners.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="space-y-4">
                            <p className="text-muted-foreground">Geen partners gevonden</p>
                            {partners.length === 0 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                                <p className="text-sm text-blue-800 mb-2">
                                  <strong>Hoe partners toevoegen?</strong>
                                </p>
                                <p className="text-xs text-blue-700">
                                  Partners worden automatisch toegevoegd wanneer klanten zich aanmelden via de "Word Partner" knop.
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto Account Creator Tab */}
        <TabsContent value="auto-create" className="space-y-4">
          <AutoAccountCreator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerAccountManagementClean;