import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, UserPlus, Key, Mail, Zap, Edit2, Trash2, Ban, RotateCcw, Users, CheckCircle2, Building2, Calendar, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/admin-client";
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
  discount_code?: string; // Add this field to prevent the "new" record error
}

const PartnerAccountManagementClean = () => {
  const [partners, setPartners] = useState<PartnerMembership[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<PartnerMembership | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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
        .in('payment_status', ['paid', 'cancelled', 'pending'])
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

  const handleEditPartner = async (partner: PartnerMembership, formData: FormData) => {
    try {
      const updateData = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        company_name: formData.get('company_name') as string,
        website: formData.get('website') as string,
        industry: formData.get('industry') as string,
        description: formData.get('description') as string,
      };

      const { error } = await supabase
        .from('partner_memberships')
        .update(updateData)
        .eq('id', partner.id);
        
      if (error) throw error;
      
      toast({
        title: "Partner bijgewerkt",
        description: `${updateData.first_name} ${updateData.last_name} is succesvol bijgewerkt`
      });

      setEditDialogOpen(false);
      setEditingPartner(null);
      fetchPartners();
    } catch (error: any) {
      toast({
        title: "Fout bij bijwerken",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeletePartner = async (partner: PartnerMembership) => {
    try {
      // First delete any related company profiles using regular client with admin privileges
      const { error: profileError } = await supabase
        .from('company_profiles')
        .delete()
        .eq('partner_membership_id', partner.id);
        
      if (profileError) throw profileError;
      
      // Then delete the partner membership using regular client with admin privileges
      const { error } = await supabase
        .from('partner_memberships')
        .delete()
        .eq('id', partner.id);
        
      if (error) throw error;
      
      toast({
        title: "Partner verwijderd",
        description: `${partner.first_name} ${partner.last_name} is verwijderd`
      });

      fetchPartners();
    } catch (error: any) {
      toast({
        title: "Fout bij verwijderen",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelSubscription = async (partner: PartnerMembership) => {
    try {
      const { error } = await supabase
        .from('partner_memberships')
        .update({ payment_status: 'cancelled' })
        .eq('id', partner.id);
        
      if (error) throw error;
      
      toast({
        title: "Abonnement stopgezet",
        description: `Abonnement van ${partner.first_name} ${partner.last_name} is stopgezet`
      });

      fetchPartners();
    } catch (error: any) {
      toast({
        title: "Fout bij stopzetten",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReactivateSubscription = async (partner: PartnerMembership) => {
    try {
      const { error } = await supabase
        .from('partner_memberships')
        .update({ payment_status: 'paid' })
        .eq('id', partner.id);
        
      if (error) throw error;
      
      toast({
        title: "Abonnement heractiveerd",
        description: `Abonnement van ${partner.first_name} ${partner.last_name} is heractiveerd`
      });

      fetchPartners();
    } catch (error: any) {
      toast({
        title: "Fout bij heractiveren",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleResetPassword = async (partner: PartnerMembership) => {
    if (!partner.user_id) {
      toast({
        title: "Fout",
        description: "Deze partner heeft geen gebruikersaccount.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Geen actieve sessie');
      }

      const response = await fetch('https://pkvayugxzgkoipclcpli.supabase.co/functions/v1/reset-partner-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          partnerId: partner.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Er is een fout opgetreden');
      }

      // Copy password to clipboard
      await navigator.clipboard.writeText(result.tempPassword);

      toast({
        title: "Wachtwoord gereset",
        description: `Nieuw tijdelijk wachtwoord voor ${partner.first_name} ${partner.last_name}: ${result.tempPassword} (gekopieerd naar klembord)`,
        duration: 10000,
      });

    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het resetten van het wachtwoord.",
        variant: "destructive",
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="partners">Partners Overzicht</TabsTrigger>
          <TabsTrigger value="auto-accounts" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Auto Accounts
          </TabsTrigger>
          <TabsTrigger value="auto-create" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Auto Account Creator
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
                          <Badge variant={
                            partner.payment_status === 'paid' ? 'default' : 
                            partner.payment_status === 'cancelled' ? 'destructive' : 'secondary'
                          }>
                            {partner.payment_status === 'paid' ? 'Actief' : 
                             partner.payment_status === 'cancelled' ? 'Stopgezet' : 'In behandeling'}
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setEditingPartner(partner);
                                setEditDialogOpen(true);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Bewerken
                            </Button>
                            
                            {!partner.user_id && partner.payment_status === 'paid' && (
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

                            {partner.payment_status === 'paid' ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Ban className="w-4 h-4" />
                                    Stop
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Abonnement stopzetten?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Het abonnement van {partner.first_name} {partner.last_name} wordt stopgezet.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCancelSubscription(partner)}>
                                      Stop Abonnement
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : partner.payment_status === 'cancelled' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleReactivateSubscription(partner)}
                                className="flex items-center gap-2"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Heractiveer
                              </Button>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Partner verwijderen?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Dit verwijdert {partner.first_name} {partner.last_name} permanent uit het systeem. Deze actie kan niet ongedaan worden gemaakt.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePartner(partner)}>
                                    Verwijder
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
                              <div className="bg-accent/10 border border-accent rounded-lg p-4 max-w-md mx-auto">
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

        {/* Auto Accounts Overview Tab */}
        <TabsContent value="auto-accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto Accounts Overzicht</CardTitle>
              <CardDescription>
                Partners die automatisch een account hebben gekregen ({partners.filter(p => p.user_id).length} accounts)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="flex items-center p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Accounts</p>
                        <p className="text-2xl font-bold">{partners.filter(p => p.user_id).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Active Accounts</p>
                        <p className="text-2xl font-bold">{partners.filter(p => p.user_id && p.payment_status === 'paid').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Met Partner Membership</p>
                        <p className="text-2xl font-bold">{partners.filter(p => p.user_id && p.payment_status === 'paid').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Laatste Week</p>
                        <p className="text-2xl font-bold">{partners.filter(p => p.user_id && new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Auto Accounts Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Auto Accounts</h3>
                      <p className="text-sm text-muted-foreground">
                        Beheer automatisch aangemaakte accounts en hun wachtwoorden
                      </p>
                    </div>
                  </div>
                  <Button onClick={fetchPartners} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                    Vernieuwen
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Naam</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Bedrijf</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aangemaakt</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.filter(partner => partner.user_id).map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell className="font-medium">
                            {partner.first_name} {partner.last_name}
                            {partner.phone && (
                              <div className="text-sm text-muted-foreground">
                                {partner.phone}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{partner.email}</TableCell>
                          <TableCell>{partner.company_name}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Badge variant="default" className="bg-blue-500">
                                Account Actief
                              </Badge>
                              <Badge variant="default" className="bg-green-500">
                                Betaald
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(partner.created_at).toLocaleDateString('nl-NL', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              Actief
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPartner(partner);
                                  setEditDialogOpen(true);
                                }}
                                className="p-2"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              {partner.user_id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResetPassword(partner)}
                                  className="p-2 text-blue-600 hover:text-blue-700"
                                >
                                  <KeyRound className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePartner(partner)}
                                className="p-2 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {partners.filter(p => p.user_id).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="space-y-4">
                              <div className="text-muted-foreground">
                                <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Nog geen auto accounts aangemaakt</p>
                                <p className="text-sm mt-2">
                                  Gebruik de "Auto Account Creator" tab om automatisch accounts aan te maken voor partners.
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto Account Creator Tab */}
        <TabsContent value="auto-create" className="space-y-4">
          <AutoAccountCreator />
        </TabsContent>
      </Tabs>

      {/* Edit Partner Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Partner Bewerken</DialogTitle>
            <DialogDescription>
              Wijzig de gegevens van {editingPartner?.first_name} {editingPartner?.last_name}
            </DialogDescription>
          </DialogHeader>
          
          {editingPartner && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditPartner(editingPartner, new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Voornaam</Label>
                  <Input 
                    id="first_name" 
                    name="first_name" 
                    defaultValue={editingPartner.first_name}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Achternaam</Label>
                  <Input 
                    id="last_name" 
                    name="last_name" 
                    defaultValue={editingPartner.last_name}
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  defaultValue={editingPartner.email}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoon</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  defaultValue={editingPartner.phone}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_name">Bedrijfsnaam</Label>
                <Input 
                  id="company_name" 
                  name="company_name" 
                  defaultValue={editingPartner.company_name}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  name="website" 
                  defaultValue={editingPartner.website || ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Sector</Label>
                <Input 
                  id="industry" 
                  name="industry" 
                  defaultValue={editingPartner.industry || ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={editingPartner.description || ''}
                  rows={3}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button type="submit">
                  Opslaan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerAccountManagementClean;