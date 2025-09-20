import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users, CreditCard, Edit, Trash2, Download, Filter, Eye, Save, Home, ShoppingBag, Building2, Plus, Globe, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import CompanyProfileForm from "@/components/CompanyProfileForm";

interface Membership {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  job_title: string;
  industry_role: string;
  experience_years: string;
  specializations: string[];
  motivation?: string;
  respectful_practices?: string;
  respectful_workplace?: string;
  boundary_behavior?: string;
  membership_type: 'klein' | 'middelgroot' | 'groot' | 'offerte';
  payment_status: string;
  amount: number;
  currency: string;
  mollie_payment_id?: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  user_id?: string | null;
  email?: string | null;
  items: any;  // Changed from any[] to any to match JSONB type
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  payment_status: string;
  mollie_payment_id?: string | null;
  created_at: string;
  updated_at: string;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  address_street?: string | null;
  address_house_number?: string | null;
  address_postcode?: string | null;
  address_city?: string | null;
  address_country?: string | null;
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
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'memberships' | 'orders' | 'profiles'>("memberships");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Niet ingelogd",
          description: "Je moet ingelogd zijn om het dashboard te gebruiken",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      setUser(user);

      // Check if user is admin
      const { data: adminCheck } = await supabase.rpc('verify_admin_access');
      if (!adminCheck) {
        toast({
          title: "Geen toegang",
          description: "Je hebt geen admin rechten",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await Promise.all([fetchMemberships(), fetchOrders(), fetchProfiles()]);
    } catch (error) {
      console.error('Auth check error:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het controleren van toegang",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const fetchMemberships = async () => {
    try {
      // Use regular client - RLS policies will allow admin access
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemberships(data || []);
    } catch (error) {
      console.error('Error fetching memberships:', error);
      toast({
        title: "Fout",
        description: "Kon lidmaatschappen niet laden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Fout",
        description: "Kon bestellingen niet laden",
        variant: "destructive"
      });
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Fout",
        description: "Kon bedrijfsprofielen niet laden",
        variant: "destructive"
      });
    }
  };


  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('memberships')
        .update({ payment_status: status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      await fetchMemberships();
      toast({
        title: "Bijgewerkt",
        description: "Payment status is bijgewerkt"
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Fout",
        description: "Kon status niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const updateMembership = async (updatedMembership: Membership) => {
    try {
      const { error } = await supabase
        .from('memberships')
        .update({
          first_name: updatedMembership.first_name,
          last_name: updatedMembership.last_name,
          email: updatedMembership.email,
          phone: updatedMembership.phone,
          company: updatedMembership.company,
          job_title: updatedMembership.job_title,
          industry_role: updatedMembership.industry_role,
          experience_years: updatedMembership.experience_years,
          specializations: updatedMembership.specializations,
          membership_type: updatedMembership.membership_type,
          payment_status: updatedMembership.payment_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedMembership.id);

      if (error) throw error;
      
      await fetchMemberships();
      setIsEditing(false);
      setEditingMembership(null);
      toast({
        title: "Bijgewerkt",
        description: "Lidmaatschap is succesvol bijgewerkt"
      });
    } catch (error) {
      console.error('Error updating membership:', error);
      toast({
        title: "Fout",
        description: "Kon lidmaatschap niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const deleteMembership = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit lidmaatschap wilt verwijderen?')) return;
    
    try {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchMemberships();
      toast({
        title: "Verwijderd",
        description: "Lidmaatschap is verwijderd"
      });
    } catch (error) {
      console.error('Error deleting membership:', error);
      toast({
        title: "Fout",
        description: "Kon lidmaatschap niet verwijderen",
        variant: "destructive"
      });
    }
  };

  const handleEditProfile = (profile: CompanyProfile) => {
    setEditingProfile(profile);
    setShowProfileForm(true);
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit bedrijfsprofiel wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('company_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Bedrijfsprofiel succesvol verwijderd.",
      });

      fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Fout",
        description: "Kon bedrijfsprofiel niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  const handleProfileFormClose = () => {
    setShowProfileForm(false);
    setEditingProfile(null);
  };

  const handleProfileFormSuccess = () => {
    fetchProfiles();
    handleProfileFormClose();
  };

  const filteredMemberships = memberships.filter(membership => {
    const matchesSearch = 
      membership.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membership.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membership.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membership.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || membership.payment_status === statusFilter;
    const matchesType = typeFilter === "all" || membership.membership_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      failed: "destructive",
      expired: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      klein: "bg-blue-100 text-blue-800",
      middelgroot: "bg-yellow-100 text-yellow-800",
      groot: "bg-purple-100 text-purple-800",
      offerte: "bg-green-100 text-green-800"
    };
    return (
      <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>
        {type === 'offerte' ? 'Offerte' : type}
      </Badge>
    );
  };

  const formatPrice = (amount: number) => `€${(amount / 100).toFixed(2)}`;

  const exportToCsv = () => {
    if (viewMode === 'memberships') {
      const csvContent = [
        ["Naam", "Email", "Bedrijf", "Type", "Status", "Bedrag", "Datum"].join(","),
        ...filteredMemberships.map(m => [
          `${m.first_name} ${m.last_name}`,
          m.email,
          m.company || "",
          m.membership_type,
          m.payment_status,
          formatPrice(m.amount),
          new Date(m.created_at).toLocaleDateString()
        ].join(","))
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", "lidmaatschappen.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const csvContent = [
        ["Naam", "Email", "Telefoon", "Adres", "Status", "Totaal", "Datum"].join(","),
        ...filteredOrders.map(o => [
          `${o.customer_first_name || ''} ${o.customer_last_name || ''}`.trim() || '-',
          o.customer_email || o.email || '-',
          o.customer_phone || '-',
          `${o.address_street || ''} ${o.address_house_number || ''}, ${o.address_postcode || ''} ${o.address_city || ''}`.trim(),
          o.payment_status,
          formatPrice(o.total),
          new Date(o.created_at).toLocaleDateString()
        ].join(","))
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", "bestellingen.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const stats = viewMode === 'memberships'
    ? {
        total: memberships.length,
        paid: memberships.filter(m => m.payment_status === 'paid').length,
        pending: memberships.filter(m => m.payment_status === 'pending').length,
        revenue: memberships
          .filter(m => m.payment_status === 'paid')
          .reduce((sum, m) => sum + m.amount, 0)
      }
    : viewMode === 'orders'
    ? {
        total: orders.length,
        paid: orders.filter(o => o.payment_status === 'paid').length,
        pending: orders.filter(o => o.payment_status === 'pending').length,
        revenue: orders
          .filter(o => o.payment_status === 'paid')
          .reduce((sum, o) => sum + o.total, 0)
      }
    : {
        total: profiles.length,
        paid: profiles.filter(p => p.is_featured).length,
        pending: profiles.filter(p => !p.is_featured).length,
        revenue: 0
      };

  const filteredOrders = orders.filter(order => {
    const name = `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.toLowerCase();
    const email = (order.customer_email || order.email || '').toLowerCase();
    const address = `${order.address_street || ''} ${order.address_house_number || ''} ${order.address_postcode || ''} ${order.address_city || ''}`.toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase()) || address.includes(searchTerm.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || order.payment_status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Dashboard Toegang</h2>
              <p className="text-muted-foreground mb-4">
                Je moet ingelogd zijn als admin om het dashboard te gebruiken.
              </p>
              <Link to="/">
                <Button>Terug naar Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-2 sm:p-4 lg:p-6 xl:p-8 mt-16">
      <div className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Beheer lidmaatschappen en bestellingen</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-shrink-0">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <Button onClick={exportToCsv} className="flex items-center gap-2 w-full sm:w-auto">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'memberships' | 'orders' | 'profiles')}>
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="memberships" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Lidmaatschappen
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Bestellingen
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Bedrijven
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {viewMode === 'memberships' ? 'Totaal Leden' : viewMode === 'orders' ? 'Totaal Bestellingen' : 'Totaal Bedrijven'}
              </CardTitle>
              {viewMode === 'memberships' ? (
                <Users className="w-4 h-4 text-muted-foreground" />
              ) : viewMode === 'orders' ? (
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Building2 className="w-4 h-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {viewMode === 'profiles' ? 'Featured' : 'Betaald'}
              </CardTitle>
              <CreditCard className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {viewMode === 'profiles' ? 'Regulier' : 'In Behandeling'}
              </CardTitle>
              <CreditCard className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Omzet</CardTitle>
              <CreditCard className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {viewMode === 'profiles' ? '-' : formatPrice(stats.revenue)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row flex-wrap gap-4">
              <div className="flex items-center gap-2 w-full md:w-auto md:flex-1">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={viewMode === 'memberships' ? "Zoek op naam, email of bedrijf..." : "Zoek op naam, email of adres..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:max-w-md"
                />
              </div>
              {viewMode === 'memberships' ? (
                <>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter op status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle statussen</SelectItem>
                      <SelectItem value="paid">Betaald</SelectItem>
                      <SelectItem value="pending">In behandeling</SelectItem>
                      <SelectItem value="failed">Mislukt</SelectItem>
                      <SelectItem value="expired">Verlopen</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter op type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle types</SelectItem>
                      <SelectItem value="klein">Klein</SelectItem>
                      <SelectItem value="middelgroot">Middelgroot</SelectItem>
                      <SelectItem value="groot">Groot</SelectItem>
                      <SelectItem value="offerte">Offerte</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter op status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statussen</SelectItem>
                    <SelectItem value="paid">Betaald</SelectItem>
                    <SelectItem value="pending">In behandeling</SelectItem>
                    <SelectItem value="failed">Mislukt</SelectItem>
                    <SelectItem value="expired">Verlopen</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Memberships Table */}
        {viewMode === 'memberships' && (
        <Card>
          <CardHeader>
            <CardTitle>Lidmaatschappen ({filteredMemberships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Naam</TableHead>
                  <TableHead className="hidden sm:table-cell min-w-[180px]">Email</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[120px]">Bedrijf</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[100px]">Bedrag</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[100px]">Datum</TableHead>
                  <TableHead className="min-w-[120px]">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemberships.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell className="font-medium min-w-[150px]">
                      <div>
                        <div>{membership.first_name} {membership.last_name}</div>
                        <div className="text-sm text-muted-foreground sm:hidden">{membership.email}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{membership.company || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell min-w-[180px]">{membership.email}</TableCell>
                    <TableCell className="hidden md:table-cell min-w-[120px]">{membership.company || '-'}</TableCell>
                    <TableCell className="min-w-[100px]">{getTypeBadge(membership.membership_type)}</TableCell>
                    <TableCell className="min-w-[100px]">{getStatusBadge(membership.payment_status)}</TableCell>
                    <TableCell className="hidden lg:table-cell min-w-[100px]">{formatPrice(membership.amount)}</TableCell>
                    <TableCell className="hidden md:table-cell min-w-[100px]">{new Date(membership.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedMembership(membership);
                                setEditingMembership(membership);
                                setIsEditing(false);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                            <DialogHeader>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <DialogTitle>Lidmaatschap Details</DialogTitle>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsEditing(!isEditing)}
                                  className="flex items-center gap-2 w-full sm:w-auto"
                                >
                                  <Edit className="w-4 h-4" />
                                  {isEditing ? 'Annuleren' : 'Bewerken'}
                                </Button>
                              </div>
                            </DialogHeader>
                            {selectedMembership && editingMembership && (
                              <div className="space-y-6">
                                {!isEditing ? (
                                  <>
                                    {/* View Mode */}
                                    {/* Personal Information */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-primary">Persoonlijke Gegevens</h3>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Voor- en achternaam</label>
                                          <p className="mt-1">{selectedMembership.first_name} {selectedMembership.last_name}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                                          <p className="mt-1">{selectedMembership.email}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Telefoon</label>
                                          <p className="mt-1">{selectedMembership.phone}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Bedrijf</label>
                                          <p className="mt-1">{selectedMembership.company || 'Niet opgegeven'}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Professional Information */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-primary">Professionele Gegevens</h3>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Huidige functie</label>
                                          <p className="mt-1 capitalize">{selectedMembership.job_title}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Rol in de sector</label>
                                          <p className="mt-1 capitalize">{selectedMembership.industry_role}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Jaren ervaring</label>
                                          <p className="mt-1">{selectedMembership.experience_years} jaar</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Type lidmaatschap</label>
                                          <div className="mt-1">{getTypeBadge(selectedMembership.membership_type)}</div>
                                        </div>
                                      </div>
                                    </div>

                                {/* Specializations */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3 text-primary">Specialisaties & Interesses</h3>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Gekozen specialisaties</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {selectedMembership.specializations.map((spec, idx) => (
                                        <Badge key={idx} variant="secondary" className="capitalize">
                                          {spec.replace('-', ' ')}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Open Questions & Answers */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3 text-primary">Motivatie & Visie</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Waarom wil je lid worden van Bouw met Respect?</label>
                                      <p className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                                        {(selectedMembership as any).motivation || 'Niet ingevuld'}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Hoe pas je respectvolle bouwpraktijken toe in je werk?</label>
                                      <p className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                                        {(selectedMembership as any).respectful_practices || 'Niet ingevuld'}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Wat betekent een respectvolle bouwplaats voor jou?</label>
                                      <p className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                                        {(selectedMembership as any).respectful_workplace || 'Niet ingevuld'}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Wat doe jij als je grensoverschrijdend gedrag opmerkt?</label>
                                      <p className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                                        {(selectedMembership as any).boundary_behavior || 'Niet ingevuld'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                    {/* Payment Information */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-primary">Betaalgegevens</h3>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Bedrag</label>
                                          <p className="mt-1 font-semibold">{formatPrice(selectedMembership.amount)}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Mollie Payment ID</label>
                                          <p className="mt-1 text-xs font-mono">{selectedMembership.mollie_payment_id || 'Geen ID'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Aangemeld op</label>
                                          <p className="mt-1">{new Date(selectedMembership.created_at).toLocaleString('nl-NL')}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Laatst bijgewerkt</label>
                                          <p className="mt-1">{new Date(selectedMembership.updated_at).toLocaleString('nl-NL')}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Status Update */}
                                    <div className="border-t pt-4">
                                      <label className="text-sm font-medium text-muted-foreground">Payment status bijwerken</label>
                                      <Select 
                                        value={selectedMembership.payment_status} 
                                        onValueChange={(value) => updatePaymentStatus(selectedMembership.id, value)}
                                      >
                                        <SelectTrigger className="w-48 mt-2">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">In behandeling</SelectItem>
                                          <SelectItem value="paid">Betaald</SelectItem>
                                          <SelectItem value="failed">Mislukt</SelectItem>
                                          <SelectItem value="expired">Verlopen</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Edit Mode */}
                                    <div className="space-y-6">
                                      {/* Personal Information */}
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3 text-primary">Persoonlijke Gegevens</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Voornaam</label>
                                            <Input
                                              value={editingMembership.first_name}
                                              onChange={(e) => setEditingMembership({...editingMembership, first_name: e.target.value})}
                                              className="mt-1"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Achternaam</label>
                                            <Input
                                              value={editingMembership.last_name}
                                              onChange={(e) => setEditingMembership({...editingMembership, last_name: e.target.value})}
                                              className="mt-1"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                                            <Input
                                              type="email"
                                              value={editingMembership.email}
                                              onChange={(e) => setEditingMembership({...editingMembership, email: e.target.value})}
                                              className="mt-1"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Telefoon</label>
                                            <Input
                                              value={editingMembership.phone}
                                              onChange={(e) => setEditingMembership({...editingMembership, phone: e.target.value})}
                                              className="mt-1"
                                            />
                                          </div>
                                          <div className="sm:col-span-2">
                                            <label className="text-sm font-medium text-muted-foreground">Bedrijf</label>
                                            <Input
                                              value={editingMembership.company || ''}
                                              onChange={(e) => setEditingMembership({...editingMembership, company: e.target.value})}
                                              className="mt-1"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Professional Information */}
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3 text-primary">Professionele Gegevens</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Functie</label>
                                            <Input
                                              value={editingMembership.job_title}
                                              onChange={(e) => setEditingMembership({...editingMembership, job_title: e.target.value})}
                                              className="mt-1"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Rol in sector</label>
                                            <Select 
                                              value={editingMembership.industry_role} 
                                              onValueChange={(value) => setEditingMembership({...editingMembership, industry_role: value})}
                                            >
                                              <SelectTrigger className="mt-1">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="architect">Architect</SelectItem>
                                                <SelectItem value="projectleider">Projectleider</SelectItem>
                                                <SelectItem value="aannemer">Aannemer</SelectItem>
                                                <SelectItem value="consultant">Consultant</SelectItem>
                                                <SelectItem value="developer">Developer</SelectItem>
                                                <SelectItem value="anders">Anders</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Ervaring</label>
                                            <Select 
                                              value={editingMembership.experience_years} 
                                              onValueChange={(value) => setEditingMembership({...editingMembership, experience_years: value})}
                                            >
                                              <SelectTrigger className="mt-1">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="0-2">0-2 jaar</SelectItem>
                                                <SelectItem value="3-5">3-5 jaar</SelectItem>
                                                <SelectItem value="6-10">6-10 jaar</SelectItem>
                                                <SelectItem value="11+">11+ jaar</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Type lidmaatschap</label>
                                            <Select 
                                              value={editingMembership.membership_type} 
                                              onValueChange={(value: 'klein' | 'middelgroot' | 'groot' | 'offerte') => setEditingMembership({...editingMembership, membership_type: value})}
                                            >
                                              <SelectTrigger className="mt-1">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="klein">Klein</SelectItem>
                                                <SelectItem value="middelgroot">Middelgroot</SelectItem>
                                                <SelectItem value="groot">Groot</SelectItem>
                                                <SelectItem value="offerte">Offerte</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Payment Status */}
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3 text-primary">Payment Status</h3>
                                        <Select 
                                          value={editingMembership.payment_status} 
                                          onValueChange={(value) => setEditingMembership({...editingMembership, payment_status: value})}
                                        >
                                          <SelectTrigger className="w-48">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">In behandeling</SelectItem>
                                            <SelectItem value="paid">Betaald</SelectItem>
                                            <SelectItem value="failed">Mislukt</SelectItem>
                                            <SelectItem value="expired">Verlopen</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Save Button */}
                                      <div className="border-t pt-4 flex flex-col sm:flex-row gap-3">
                                        <Button 
                                          onClick={() => updateMembership(editingMembership)}
                                          className="flex items-center gap-2 w-full sm:w-auto"
                                        >
                                          <Save className="w-4 h-4" />
                                          Opslaan
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          onClick={() => {
                                            setEditingMembership(selectedMembership);
                                            setIsEditing(false);
                                          }}
                                          className="w-full sm:w-auto"
                                        >
                                          Annuleren
                                        </Button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteMembership(membership.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Orders Table */}
        {viewMode === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Bestellingen ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Klant</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[180px]">Contact</TableHead>
                    <TableHead className="min-w-[220px]">Adres</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[100px]">Totaal</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[140px]">Datum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="min-w-[180px]">
                        <div className="font-medium">{`${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim() || '-'}</div>
                        <div className="text-xs text-muted-foreground">{order.mollie_payment_id || '-'}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell min-w-[180px]">
                        <div>{order.customer_email || order.email || '-'}</div>
                        <div className="text-xs text-muted-foreground">{order.customer_phone || '-'}</div>
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        {`${order.address_street || ''} ${order.address_house_number || ''}`.trim()}<br/>
                        {`${order.address_postcode || ''} ${order.address_city || ''}`.trim()}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{formatPrice(order.total)}</TableCell>
                      <TableCell className="hidden md:table-cell">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Company Profiles Section */}
        {viewMode === 'profiles' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Bedrijfsprofielen ({profiles.length})</CardTitle>
                <Button onClick={() => setShowProfileForm(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nieuw Profiel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profiles.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Geen bedrijfsprofielen gevonden</h3>
                  <p className="text-muted-foreground">
                    Voeg het eerste bedrijfsprofiel toe om te beginnen.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map((profile) => (
                    <Card key={profile.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {profile.logo_url ? (
                              <img
                                src={profile.logo_url}
                                alt={`${profile.name} logo`}
                                className="w-12 h-12 object-contain rounded-lg border"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-lg">{profile.name}</CardTitle>
                              {profile.industry && (
                                <Badge variant="secondary" className="mt-1">
                                  {profile.industry}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {profile.is_featured && (
                            <Badge variant="default">Featured</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {profile.description && (
                          <CardDescription className="mb-4 line-clamp-3">
                            {profile.description}
                          </CardDescription>
                        )}
                        
                        <div className="space-y-2">
                          {profile.website && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Globe className="w-4 h-4" />
                              <a
                                href={profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary truncate"
                              >
                                {profile.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                          {profile.contact_email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <a
                                href={`mailto:${profile.contact_email}`}
                                className="hover:text-primary truncate"
                              >
                                {profile.contact_email}
                              </a>
                            </div>
                          )}
                          {profile.contact_phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <a
                                href={`tel:${profile.contact_phone}`}
                                className="hover:text-primary"
                              >
                                {profile.contact_phone}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProfile(profile)}
                          >
                            Bewerken
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Verwijderen
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <CompanyProfileForm
          open={showProfileForm}
          onOpenChange={handleProfileFormClose}
          onSuccess={handleProfileFormSuccess}
          editingProfile={editingProfile}
        />
      </div>
    </div>
  );
};

export default Dashboard;