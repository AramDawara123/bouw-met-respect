import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Euro, Save, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PartnerPricing {
  id: string;
  company_name: string;
  amount: number;
  currency: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

const PartnerPricingManager = () => {
  const [partners, setPartners] = useState<PartnerPricing[]>([]);
  const [editingPartner, setEditingPartner] = useState<PartnerPricing | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_memberships')
        .select('id, company_name, amount, currency, payment_status, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast({
        title: "Fout",
        description: "Kon partner prijzen niet laden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!editingPartner) return;

    try {
      const { error } = await supabase
        .from('partner_memberships')
        .update({
          amount: editingPartner.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPartner.id);

      if (error) throw error;

      toast({
        title: "Bijgewerkt",
        description: "Partner prijs is succesvol bijgewerkt"
      });

      setIsEditing(false);
      setEditingPartner(null);
      fetchPartners();
    } catch (error) {
      console.error('Error updating partner price:', error);
      toast({
        title: "Fout",
        description: "Kon partner prijs niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `€${(priceInCents / 100).toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Betaald</Badge>;
      case 'pending':
        return <Badge variant="secondary">In behandeling</Badge>;
      case 'failed':
        return <Badge variant="destructive">Mislukt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Partner Prijzen</h2>
            <p className="text-muted-foreground">Laden...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Partner Prijzen</h2>
          <p className="text-muted-foreground">Beheer de prijzen voor partner abonnementen</p>
        </div>
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Partner Abonnementen ({partners.length})
          </CardTitle>
          <CardDescription>
            Overzicht van alle partner abonnementen en hun prijzen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bedrijfsnaam</TableHead>
                  <TableHead>Prijs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aangemaakt</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="font-medium">{partner.company_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{formatPrice(partner.amount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(partner.payment_status)}</TableCell>
                    <TableCell>
                      {new Date(partner.created_at).toLocaleDateString('nl-NL')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPartner(partner);
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Bewerken
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {partners.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Geen partner abonnementen gevonden</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Price Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prijs Bewerken</DialogTitle>
          </DialogHeader>
          {editingPartner && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Bedrijfsnaam</label>
                <Input
                  value={editingPartner.company_name}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Prijs (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={(editingPartner.amount / 100).toFixed(2)}
                  onChange={(e) => {
                    const euros = parseFloat(e.target.value) || 0;
                    setEditingPartner({
                      ...editingPartner,
                      amount: Math.round(euros * 100) // Convert to cents
                    });
                  }}
                  placeholder="500.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Huidige prijs: {formatPrice(editingPartner.amount)}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleUpdatePrice} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Opslaan
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditingPartner(null);
                  }}
                >
                  Annuleren
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerPricingManager;