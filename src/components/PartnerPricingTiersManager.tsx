import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pencil, Save, X, RefreshCw, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PartnerPricingTier {
  id: string;
  employee_range: string;
  price_cents: number;
  price_display: string;
  is_quote: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PartnerPricingTiersManager = () => {
  const [tiers, setTiers] = useState<PartnerPricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<PartnerPricingTier>>({});
  const { toast } = useToast();

  const fetchTiers = async () => {
    try {
      console.log('🔄 Fetching partner pricing tiers...');
      const { data, error } = await supabase
        .from('partner_pricing_tiers')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      console.log('✅ Partner pricing tiers fetched:', data);
      setTiers(data || []);
    } catch (error) {
      console.error('❌ Error fetching partner pricing tiers:', error);
      toast({
        title: "Fout",
        description: "Kon partner prijzen niet laden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (tier: PartnerPricingTier) => {
    setEditingId(tier.id);
    setEditingData({ ...tier });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  const saveChanges = async () => {
    if (!editingId || !editingData) return;

    try {
      const { error } = await supabase
        .from('partner_pricing_tiers')
        .update({
          employee_range: editingData.employee_range,
          price_cents: editingData.price_cents,
          price_display: editingData.price_display,
          is_quote: editingData.is_quote,
          display_order: editingData.display_order,
          is_active: editingData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) throw error;

      toast({
        title: "Bijgewerkt",
        description: "Partner prijzen zijn succesvol bijgewerkt"
      });

      setEditingId(null);
      setEditingData({});
      fetchTiers();
    } catch (error) {
      console.error('Error updating tier:', error);
      toast({
        title: "Fout",
        description: "Kon partner prijzen niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const addNewTier = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_pricing_tiers')
        .insert({
          employee_range: 'Nieuwe groep',
          price_cents: 50000,
          price_display: '€500',
          is_quote: false,
          display_order: tiers.length + 1,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Toegevoegd",
        description: "Nieuwe partner prijsgroep is toegevoegd"
      });

      fetchTiers();
      if (data) {
        startEditing(data);
      }
    } catch (error) {
      console.error('Error adding new tier:', error);
      toast({
        title: "Fout",
        description: "Kon nieuwe partner prijsgroep niet toevoegen",
        variant: "destructive"
      });
    }
  };

  const deleteTier = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze prijsgroep wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('partner_pricing_tiers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Verwijderd",
        description: "Partner prijsgroep is verwijderd"
      });

      fetchTiers();
    } catch (error) {
      console.error('Error deleting tier:', error);
      toast({
        title: "Fout",
        description: "Kon partner prijsgroep niet verwijderen",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Partner prijzen laden...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-blue-600">Partner Prijzen Beheer</CardTitle>
            <CardDescription>
              Beheer de prijzen voor partners op basis van bedrijfsgrootte
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchTiers}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
              Vernieuwen
            </Button>
            <Button
              onClick={addNewTier}
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Nieuwe Groep
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tiers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Geen partner prijzen gevonden
          </div>
        ) : (
          <div className="space-y-4">
            {tiers.map((tier) => (
              <Card key={tier.id} className="border border-border/50">
                <CardContent className="p-4">
                  {editingId === tier.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Bedrijfsgrootte</label>
                          <Input
                            value={editingData.employee_range || ''}
                            onChange={(e) => setEditingData({
                              ...editingData,
                              employee_range: e.target.value
                            })}
                            placeholder="bijv. 1-10 medewerkers"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Prijs Display</label>
                          <Input
                            value={editingData.price_display || ''}
                            onChange={(e) => setEditingData({
                              ...editingData,
                              price_display: e.target.value
                            })}
                            placeholder="bijv. €750"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Prijs (in centen)</label>
                          <Input
                            type="number"
                            value={editingData.price_cents || 0}
                            onChange={(e) => setEditingData({
                              ...editingData,
                              price_cents: parseInt(e.target.value) || 0
                            })}
                            placeholder="75000"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Volgorde</label>
                          <Input
                            type="number"
                            value={editingData.display_order || 0}
                            onChange={(e) => setEditingData({
                              ...editingData,
                              display_order: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editingData.is_quote || false}
                            onCheckedChange={(checked) => setEditingData({
                              ...editingData,
                              is_quote: checked
                            })}
                          />
                          <label className="text-sm font-medium">Offerte</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editingData.is_active !== false}
                            onCheckedChange={(checked) => setEditingData({
                              ...editingData,
                              is_active: checked
                            })}
                          />
                          <label className="text-sm font-medium">Actief</label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={cancelEditing}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                          Annuleren
                        </Button>
                        <Button
                          onClick={saveChanges}
                          size="sm"
                        >
                          <Save className="w-4 h-4" />
                          Opslaan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{tier.employee_range}</h4>
                          {tier.is_quote && (
                            <Badge variant="secondary">Offerte</Badge>
                          )}
                          {!tier.is_active && (
                            <Badge variant="destructive">Inactief</Badge>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-blue-600">
                          {tier.price_display}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Volgorde: {tier.display_order} | Prijs: {tier.price_cents} centen
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEditing(tier)}
                          variant="outline"
                          size="sm"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteTier(tier.id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerPricingTiersManager;