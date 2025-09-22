import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Save, X, Euro, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MembershipPricing {
  id: string;
  membership_type: string;
  price: number; // in cents
  yearly_price_display: string;
  employees_range: string;
  created_at: string;
  updated_at: string;
}

const MembershipPricingManager = () => {
  const [pricingData, setPricingData] = useState<MembershipPricing[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<MembershipPricing>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_pricing')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setPricingData(data || []);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast({
        title: "Fout",
        description: "Kon prijsgegevens niet laden",
        variant: "destructive"
      });
    }
  };

  const startEditing = (pricing: MembershipPricing) => {
    setEditingId(pricing.id);
    setEditingData({
      ...pricing,
      price: pricing.price / 100 // Convert cents to euros for display
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  const saveChanges = async () => {
    if (!editingId || !editingData) return;

    try {
      const priceInCents = Math.round((editingData.price as number) * 100);
      const priceDisplay = `€${editingData.price}`;

      const { error } = await supabase
        .from('membership_pricing')
        .update({
          price: priceInCents,
          yearly_price_display: priceDisplay,
          employees_range: editingData.employees_range
        })
        .eq('id', editingId);

      if (error) throw error;

      toast({
        title: "Opgeslagen",
        description: "Lidmaatschapprijzen zijn bijgewerkt"
      });

      setEditingId(null);
      setEditingData({});
      fetchPricingData();
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({
        title: "Fout",
        description: "Kon prijsgegevens niet opslaan",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `€${(priceInCents / 100).toFixed(0)}`;
  };

  const getMembershipDisplayName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'klein': return 'bg-blue-100 text-blue-800';
      case 'middelgroot': return 'bg-yellow-100 text-yellow-800';
      case 'groot': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Lidmaatschap Prijzen</h2>
        <p className="text-muted-foreground">Beheer de prijzen voor verschillende lidmaatschapstypen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5" />
            Prijsoverzicht
          </CardTitle>
          <CardDescription>
            Klik op "Bewerken" om de prijzen aan te passen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lidmaatschapstype</TableHead>
                  <TableHead>Medewerkers Range</TableHead>
                  <TableHead>Prijs per jaar</TableHead>
                  <TableHead>Laatst bijgewerkt</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingData.map((pricing) => (
                  <TableRow key={pricing.id}>
                    <TableCell>
                      <Badge className={getMembershipColor(pricing.membership_type)}>
                        {getMembershipDisplayName(pricing.membership_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === pricing.id ? (
                        <Input
                          value={editingData.employees_range || ''}
                          onChange={(e) => setEditingData({
                            ...editingData,
                            employees_range: e.target.value
                          })}
                          className="w-40"
                        />
                      ) : (
                        pricing.employees_range
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {editingId === pricing.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">€</span>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={editingData.price || 0}
                            onChange={(e) => setEditingData({
                              ...editingData,
                              price: parseFloat(e.target.value) || 0
                            })}
                            className="w-24"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">
                            {formatPrice(pricing.price)}
                          </span>
                          <span className="text-muted-foreground">/jaar</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(pricing.updated_at).toLocaleDateString('nl-NL')}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === pricing.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={saveChanges}
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            Opslaan
                          </Button>
                          <Button
                            onClick={cancelEditing}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Annuleren
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => startEditing(pricing)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Bewerken
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {pricingData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Geen prijsgegevens gevonden. Controleer of de database migration is uitgevoerd.
            </p>
            <Button onClick={fetchPricingData} className="mt-4">
              Opnieuw laden
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MembershipPricingManager;