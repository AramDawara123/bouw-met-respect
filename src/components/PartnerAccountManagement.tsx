import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Trash2, Plus, UserPlus, Key, Mail, Zap } from "lucide-react";
import AutoAccountCreator from "./AutoAccountCreator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import * as z from "zod";
interface PartnerMembership {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  payment_status: string;
  user_id: string | null;
  created_at: string;
}
const createAccountSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 karakters bevatten"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"]
});
const editAccountSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in"),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional()
}).refine(data => {
  if (data.newPassword && !data.confirmPassword) return false;
  if (!data.newPassword && data.confirmPassword) return false;
  if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) return false;
  return true;
}, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"]
});
const addPartnerSchema = z.object({
  first_name: z.string().min(1, "Voornaam is verplicht"),
  last_name: z.string().min(1, "Achternaam is verplicht"),
  email: z.string().email("Ongeldig email adres"),
  phone: z.string().min(1, "Telefoon is verplicht"),
  company_name: z.string().min(1, "Bedrijfsnaam is verplicht"),
  website: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  create_account: z.boolean().default(true),
  password: z.string().optional(),
  confirmPassword: z.string().optional()
}).refine(data => {
  if (data.create_account) {
    if (!data.password) return false;
    if (data.password.length < 8) return false;
    if (data.password !== data.confirmPassword) return false;
  }
  return true;
}, {
  message: "Wachtwoord vereisten niet voldaan",
  path: ["password"]
});
const PartnerAccountManagement = () => {
  const [partners, setPartners] = useState<PartnerMembership[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddPartnerDialog, setShowAddPartnerDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerMembership | null>(null);
  const {
    toast
  } = useToast();
  const createForm = useForm<z.infer<typeof createAccountSchema>>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });
  const editForm = useForm<z.infer<typeof editAccountSchema>>({
    resolver: zodResolver(editAccountSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: ""
    }
  });
  const addPartnerForm = useForm<z.infer<typeof addPartnerSchema>>({
    resolver: zodResolver(addPartnerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company_name: "",
      website: "",
      industry: "",
      description: "",
      create_account: true,
      password: "",
      confirmPassword: ""
    }
  });
  useEffect(() => {
    checkAdminAccess();
    fetchPartners();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('user_id', user.id)
          .single();
        
        setIsAdmin(profile?.is_admin === true || profile?.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setAdminLoading(false);
    }
  };
  const fetchPartners = async () => {
    try {
      // Use regular client with admin access via RLS policies
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
  const filteredPartners = partners.filter(partner => partner.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || partner.last_name.toLowerCase().includes(searchTerm.toLowerCase()) || partner.email.toLowerCase().includes(searchTerm.toLowerCase()) || partner.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  const handleCreateAccount = async (values: z.infer<typeof createAccountSchema>) => {
    if (!selectedPartner) return;
    
    try {
      // Create user account in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/partner-dashboard`
        }
      });
      
      if (authError) {
        // Handle specific rate limiting error
        if (authError.message.includes('security purposes') || authError.message.includes('rate limit')) {
          throw new Error('Te veel pogingen. Probeer het over een paar minuten opnieuw.');
        }
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Account aanmaken mislukt');
      }

      // Update partner membership with user_id
      const { error: updateError } = await supabase.from('partner_memberships')
        .update({ user_id: authData.user.id })
        .eq('id', selectedPartner.id);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Account aangemaakt",
        description: `Account voor ${selectedPartner.first_name} ${selectedPartner.last_name} is aangemaakt`
      });
      setShowCreateDialog(false);
      setSelectedPartner(null);
      createForm.reset();
      fetchPartners();
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: "Fout",
        description: error.message || "Kon account niet aanmaken",
        variant: "destructive"
      });
    }
  };
  const handleEditAccount = async (values: z.infer<typeof editAccountSchema>) => {
    if (!selectedPartner || !selectedPartner.user_id) return;
    try {
      // Update email if changed
      if (values.email !== selectedPartner.email) {
        const {
          error: emailError
        } = await supabase.auth.updateUser({
          email: values.email
        });
        if (emailError) throw emailError;

        // Update partner membership email
        const {
          error: updateError
        } = await supabase.from('partner_memberships').update({
          email: values.email
        }).eq('id', selectedPartner.id);
        if (updateError) throw updateError;
      }

      // Update password if provided
      if (values.newPassword) {
        const {
          error: passwordError
        } = await supabase.auth.updateUser({
          password: values.newPassword
        });
        if (passwordError) throw passwordError;
      }
      toast({
        title: "Account bijgewerkt",
        description: `Account van ${selectedPartner.first_name} ${selectedPartner.last_name} is bijgewerkt`
      });
      setShowEditDialog(false);
      setSelectedPartner(null);
      editForm.reset();
      fetchPartners();
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast({
        title: "Fout",
        description: error.message || "Kon account niet bijwerken",
        variant: "destructive"
      });
    }
  };
  const handleDeleteAccount = async (partner: PartnerMembership) => {
    if (!partner.user_id) return;
    if (!confirm(`Weet je zeker dat je het account van ${partner.first_name} ${partner.last_name} wilt verwijderen?`)) {
      return;
    }
    try {
      // Note: We can't delete the auth user from client side, but we can remove the link
      const {
        error
      } = await supabase.from('partner_memberships').update({
        user_id: null
      }).eq('id', partner.id);
      if (error) throw error;
      toast({
        title: "Account ontkoppeld",
        description: `Account van ${partner.first_name} ${partner.last_name} is ontkoppeld van het partnerschap`
      });
      fetchPartners();
    } catch (error: any) {
      console.error('Error unlinking account:', error);
      toast({
        title: "Fout",
        description: error.message || "Kon account niet ontkoppelen",
        variant: "destructive"
      });
    }
  };
  const handleAddPartner = async (values: z.infer<typeof addPartnerSchema>) => {
    try {
      let userId = null;

      // Create user account if requested
      if (values.create_account && values.password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}/partner-dashboard`
          }
        });
        
        if (authError) {
          // Handle specific rate limiting error
          if (authError.message.includes('security purposes') || authError.message.includes('rate limit')) {
            throw new Error('Te veel account aanmaak pogingen. Probeer het over een paar minuten opnieuw.');
          }
          throw authError;
        }
        
        if (!authData.user) {
          throw new Error('Account aanmaken mislukt');
        }
        userId = authData.user.id;
      }

      // Add partner to database using regular client with RLS
      const { error } = await supabase.from('partner_memberships').insert({
        user_id: userId,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        company_name: values.company_name,
        website: values.website || null,
        industry: values.industry || null,
        description: values.description || null,
        payment_status: 'paid',
        amount: 25000
      });
      if (error) throw error;
      const accountMessage = values.create_account ? " met account" : " (zonder account)";
      toast({
        title: "Partner toegevoegd",
        description: `${values.first_name} ${values.last_name} is succesvol toegevoegd als partner${accountMessage}`
      });
      setShowAddPartnerDialog(false);
      addPartnerForm.reset();
      fetchPartners();
    } catch (error: any) {
      console.error('Error adding partner:', error);
      toast({
        title: "Fout",
        description: error.message || "Kon partner niet toevoegen",
        variant: "destructive"
      });
    }
  };
  const handleDeletePartner = async (partner: PartnerMembership) => {
    if (!confirm(`Weet je zeker dat je ${partner.first_name} ${partner.last_name} permanent wilt verwijderen als partner?`)) {
      return;
    }
    try {
      const {
        error
      } = await supabase.from('partner_memberships').delete().eq('id', partner.id);
      if (error) throw error;
      toast({
        title: "Partner verwijderd",
        description: `${partner.first_name} ${partner.last_name} is verwijderd als partner`
      });
      fetchPartners();
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Fout",
        description: error.message || "Kon partner niet verwijderen",
        variant: "destructive"
      });
    }
  };
  const openCreateDialog = (partner: PartnerMembership) => {
    setSelectedPartner(partner);
    createForm.setValue('email', partner.email);
    const generatedPassword = generatePassword();
    createForm.setValue('password', generatedPassword);
    createForm.setValue('confirmPassword', generatedPassword);
    setShowCreateDialog(true);
  };
  const openEditDialog = (partner: PartnerMembership) => {
    setSelectedPartner(partner);
    editForm.setValue('email', partner.email);
    editForm.setValue('newPassword', '');
    editForm.setValue('confirmPassword', '');
    setShowEditDialog(true);
  };
  if (adminLoading || loading) {
    return <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
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
          <TabsTrigger value="add-partner">Partner Toevoegen</TabsTrigger>
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
            <Input placeholder="Zoek partners..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
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
                  <TableHead>Account Status</TableHead>
                  <TableHead>Aangemaakt</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map(partner => <TableRow key={partner.id}>
                    <TableCell className="font-medium">
                      {partner.first_name} {partner.last_name}
                    </TableCell>
                    <TableCell>{partner.email}</TableCell>
                    <TableCell>{partner.company_name}</TableCell>
                    <TableCell>
                      {partner.user_id ? <Badge className="bg-green-100 text-green-800">
                          Account Actief
                        </Badge> : <Badge variant="outline">
                          Geen Account
                        </Badge>}
                    </TableCell>
                    <TableCell>
                      {new Date(partner.created_at).toLocaleDateString('nl-NL')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!partner.user_id ? <>
                            <Button variant="outline" size="sm" onClick={() => openCreateDialog(partner)} className="flex items-center gap-2">
                              <UserPlus className="w-4 h-4" />
                              Account Aanmaken
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeletePartner(partner)} className="flex items-center gap-2 text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                              Verwijderen
                            </Button>
                          </> : <>
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(partner)} className="flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Bewerken
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteAccount(partner)} className="flex items-center gap-2 text-orange-600 hover:bg-orange-50">
                              <Trash2 className="w-4 h-4" />
                              Ontkoppelen
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeletePartner(partner)} className="flex items-center gap-2 text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                              Verwijderen
                            </Button>
                          </>}
                      </div>
                     </TableCell>
                  </TableRow>)}
                {filteredPartners.length === 0 && <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="space-y-4">
                        <p className="text-muted-foreground">Geen partners gevonden</p>
                        {partners.length === 0 && <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                            <p className="text-sm text-blue-800 mb-2">
                              <strong>Hoe partners toevoegen?</strong>
                            </p>
                            <p className="text-xs text-blue-700">
                              Partners worden automatisch toegevoegd wanneer klanten zich aanmelden via de "Word Partner" knop op de bedrijvenpagina en succesvol betalen.
                            </p>
                          </div>}
                      </div>
                    </TableCell>
                  </TableRow>}
              </TableBody>
            </Table>
          </div>
         </CardContent>
       </Card>
       </TabsContent>

       {/* Manual Partner Add Tab */}
       <TabsContent value="add-partner" className="space-y-4">
         <Card>
           <CardHeader>
             <CardTitle>Partner Handmatig Toevoegen</CardTitle>
             <CardDescription>
               Voeg een nieuwe partner handmatig toe aan het systeem
             </CardDescription>
           </CardHeader>
           <CardContent>
             <Button onClick={() => setShowAddPartnerDialog(true)} className="flex items-center gap-2">
               <Plus className="w-4 h-4" />
               Partner Toevoegen
             </Button>
           </CardContent>
         </Card>
       </TabsContent>

       {/* Auto Account Creator Tab */}
       <TabsContent value="auto-create" className="space-y-4">
         <AutoAccountCreator />
       </TabsContent>

     </Tabs>


      {/* Manual Partner Add Tab */}
      <TabsContent value="add-partner" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Partner Handmatig Toevoegen</CardTitle>
            <CardDescription>
              Voeg een nieuwe partner handmatig toe aan het systeem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowAddPartnerDialog(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Partner Toevoegen
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

       {/* Auto Account Creator Tab */}
       <TabsContent value="auto-create" className="space-y-4">
         <AutoAccountCreator />
       </TabsContent>

     </Tabs>

     {/* Create Account Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Account Aanmaken
            </DialogTitle>
          </DialogHeader>
          {selectedPartner && <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateAccount)} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Account aanmaken voor: <strong>{selectedPartner.first_name} {selectedPartner.last_name}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bedrijf: <strong>{selectedPartner.company_name}</strong>
                  </p>
                </div>

                <FormField control={createForm.control} name="email" render={({
              field
            }) => <FormItem>
                      <FormLabel>E-mailadres</FormLabel>
                      <FormControl>
                        <Input placeholder="partner@bedrijf.nl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={createForm.control} name="password" render={({
              field
            }) => <FormItem>
                      <FormLabel>Wachtwoord (automatisch gegenereerd)</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={createForm.control} name="confirmPassword" render={({
              field
            }) => <FormItem>
                      <FormLabel>Bevestig Wachtwoord</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Account Aanmaken
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setSelectedPartner(null);
                createForm.reset();
              }}>
                    Annuleren
                  </Button>
                </div>
              </form>
            </Form>}
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Account Bewerken
            </DialogTitle>
          </DialogHeader>
          {selectedPartner && <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditAccount)} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Account bewerken voor: <strong>{selectedPartner.first_name} {selectedPartner.last_name}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bedrijf: <strong>{selectedPartner.company_name}</strong>
                  </p>
                </div>

                <FormField control={editForm.control} name="email" render={({
              field
            }) => <FormItem>
                      <FormLabel>E-mailadres</FormLabel>
                      <FormControl>
                        <Input placeholder="partner@bedrijf.nl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={editForm.control} name="newPassword" render={({
              field
            }) => <FormItem>
                      <FormLabel>Nieuw Wachtwoord (optioneel)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Laat leeg om niet te wijzigen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={editForm.control} name="confirmPassword" render={({
              field
            }) => <FormItem>
                      <FormLabel>Bevestig Nieuw Wachtwoord</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Alleen nodig bij nieuw wachtwoord" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Account Bijwerken
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                setShowEditDialog(false);
                setSelectedPartner(null);
                editForm.reset();
              }}>
                    Annuleren
                  </Button>
                </div>
              </form>
            </Form>}
        </DialogContent>
      </Dialog>

      {/* Add Partner Dialog */}
      <Dialog open={showAddPartnerDialog} onOpenChange={setShowAddPartnerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nieuwe Partner Toevoegen
            </DialogTitle>
          </DialogHeader>
          <Form {...addPartnerForm}>
            <form onSubmit={addPartnerForm.handleSubmit(handleAddPartner)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={addPartnerForm.control} name="first_name" render={({
                field
              }) => <FormItem>
                      <FormLabel>Voornaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={addPartnerForm.control} name="last_name" render={({
                field
              }) => <FormItem>
                      <FormLabel>Achternaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Jansen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={addPartnerForm.control} name="email" render={({
                field
              }) => <FormItem>
                      <FormLabel>E-mailadres</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jan@bedrijf.nl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={addPartnerForm.control} name="phone" render={({
                field
              }) => <FormItem>
                      <FormLabel>Telefoon</FormLabel>
                      <FormControl>
                        <Input placeholder="+31 6 12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={addPartnerForm.control} name="company_name" render={({
                field
              }) => <FormItem>
                      <FormLabel>Bedrijfsnaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Bedrijf BV" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={addPartnerForm.control} name="industry" render={({
                field
              }) => <FormItem>
                      <FormLabel>Branche (optioneel)</FormLabel>
                      <FormControl>
                        <Input placeholder="Bouw & Constructie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <FormField control={addPartnerForm.control} name="website" render={({
              field
            }) => <FormItem>
                    <FormLabel>Website (optioneel)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.bedrijf.nl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={addPartnerForm.control} name="description" render={({
              field
            }) => <FormItem>
                    <FormLabel>Beschrijving (optioneel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Korte beschrijving van het bedrijf..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="border-t pt-4 mt-4">
                <FormField control={addPartnerForm.control} name="create_account" render={({
                field
              }) => <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Account aanmaken
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Maak direct een gebruikersaccount aan voor deze partner
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={checked => {
                    field.onChange(checked);
                    if (!checked) {
                      addPartnerForm.setValue('password', '');
                      addPartnerForm.setValue('confirmPassword', '');
                    }
                  }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                {addPartnerForm.watch('create_account') && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField control={addPartnerForm.control} name="password" render={({
                  field
                }) => <FormItem>
                          <FormLabel>Wachtwoord</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Voer wachtwoord in" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={addPartnerForm.control} name="confirmPassword" render={({
                  field
                }) => <FormItem>
                          <FormLabel>Bevestig Wachtwoord</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Bevestig wachtwoord" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Partner Toevoegen
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                setShowAddPartnerDialog(false);
                addPartnerForm.reset();
              }}>
                  Annuleren
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerAccountManagement;