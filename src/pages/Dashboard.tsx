import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users, CreditCard, Edit, Trash2, Download, Filter, Eye, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  membership_type: 'klein' | 'middelgroot' | 'groot' | 'offerte';
  payment_status: string;
  amount: number;
  currency: string;
  mollie_payment_id?: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
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
  };

  const stats = {
    total: memberships.length,
    paid: memberships.filter(m => m.payment_status === 'paid').length,
    pending: memberships.filter(m => m.payment_status === 'pending').length,
    revenue: memberships
      .filter(m => m.payment_status === 'paid')
      .reduce((sum, m) => sum + m.amount, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Beheer lidmaatschappen en bestellingen</p>
          </div>
          <Button onClick={exportToCsv} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Leden</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Betaald</CardTitle>
              <CreditCard className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Behandeling</CardTitle>
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
              <div className="text-2xl font-bold text-primary">{formatPrice(stats.revenue)}</div>
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
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek op naam, email of bedrijf..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
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
                <SelectTrigger className="w-48">
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
            </div>
          </CardContent>
        </Card>

        {/* Memberships Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lidmaatschappen ({filteredMemberships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Bedrijf</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bedrag</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemberships.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell className="font-medium">
                      {membership.first_name} {membership.last_name}
                    </TableCell>
                    <TableCell>{membership.email}</TableCell>
                    <TableCell>{membership.company || '-'}</TableCell>
                    <TableCell>{getTypeBadge(membership.membership_type)}</TableCell>
                    <TableCell>{getStatusBadge(membership.payment_status)}</TableCell>
                    <TableCell>{formatPrice(membership.amount)}</TableCell>
                    <TableCell>{new Date(membership.created_at).toLocaleDateString()}</TableCell>
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
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <div className="flex items-center justify-between">
                                <DialogTitle>Lidmaatschap Details</DialogTitle>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsEditing(!isEditing)}
                                  className="flex items-center gap-2"
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
                                      <div className="grid grid-cols-2 gap-4">
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
                                      <div className="grid grid-cols-2 gap-4">
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

                                    {/* Payment Information */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-primary">Betaalgegevens</h3>
                                      <div className="grid grid-cols-2 gap-4">
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
                                        <div className="grid grid-cols-2 gap-4">
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
                                          <div className="col-span-2">
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
                                        <div className="grid grid-cols-2 gap-4">
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
                                      <div className="border-t pt-4 flex gap-3">
                                        <Button 
                                          onClick={() => updateMembership(editingMembership)}
                                          className="flex items-center gap-2"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;