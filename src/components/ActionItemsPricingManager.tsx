import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, X, RefreshCw } from "lucide-react";

interface ActionItemsPricing {
  id: string;
  size_type: string;
  employees_range: string;
  price_display: string;
  price_cents: number;
  is_popular: boolean;
  is_quote: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const ActionItemsPricingManager = () => {
  const [pricingData, setPricingData] = useState<ActionItemsPricing[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<ActionItemsPricing>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const { data, error } = await supabase
        .from('action_items_pricing')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setPricingData(data || []);
    } catch (error) {
      console.error('Error fetching action items pricing:', error);
      toast({
        title: "Fout",
        description: "Kon prijsgegevens niet laden",
        variant: "destructive"
      });
    }
  };

  const startEditing = (pricing: ActionItemsPricing) => {
    setEditingId(pricing.id);
    setEditingData(pricing);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  const saveChanges = async () => {
    if (!editingId || !editingData) return;

    try {
      const { error } = await supabase
        .from('action_items_pricing')
        .update({
          size_type: editingData.size_type,
          employees_range: editingData.employees_range,
          price_display: editingData.price_display,
          price_cents: editingData.price_cents,
          is_popular: editingData.is_popular,
          is_quote: editingData.is_quote,
          display_order: editingData.display_order,
        })
        .eq('id', editingId);

      if (error) throw error;

      toast({
        title: "Gelukt",
        description: "Prijsgegevens bijgewerkt"
      });

      // Trigger refresh in ActionItems component
      window.dispatchEvent(new CustomEvent('action-items-pricing-updated'));
      
      setEditingId(null);
      setEditingData({});
      fetchPricingData();
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({
        title: "Fout",
        description: "Kon prijsgegevens niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const getSizeTypeColor = (sizeType: string) => {
    switch (sizeType.toLowerCase()) {
      case 'klein':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'middelgroot':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'groot':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'enterprise':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Actie-items Prijsbeheer</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchPricingData}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Vernieuwen
        </Button>
      </CardHeader>
      <CardContent>
        {pricingData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Geen prijsgegevens gevonden
            </p>
            <Button onClick={fetchPricingData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Opnieuw laden
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {pricingData.map((pricing) => (
              <Card key={pricing.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    {editingId === pricing.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="size_type">Type</Label>
                          <Input
                            id="size_type"
                            value={editingData.size_type || ''}
                            onChange={(e) => setEditingData({ ...editingData, size_type: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="employees_range">Medewerkers</Label>
                          <Input
                            id="employees_range"
                            value={editingData.employees_range || ''}
                            onChange={(e) => setEditingData({ ...editingData, employees_range: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="price_display">Prijs weergave</Label>
                          <Input
                            id="price_display"
                            value={editingData.price_display || ''}
                            onChange={(e) => setEditingData({ ...editingData, price_display: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="price_cents">Prijs (centen)</Label>
                          <Input
                            id="price_cents"
                            type="number"
                            value={editingData.price_cents || 0}
                            onChange={(e) => setEditingData({ ...editingData, price_cents: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="display_order">Volgorde</Label>
                          <Input
                            id="display_order"
                            type="number"
                            value={editingData.display_order || 0}
                            onChange={(e) => setEditingData({ ...editingData, display_order: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is_popular"
                              checked={editingData.is_popular || false}
                              onCheckedChange={(checked) => setEditingData({ ...editingData, is_popular: checked })}
                            />
                            <Label htmlFor="is_popular">Populair</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is_quote"
                              checked={editingData.is_quote || false}
                              onCheckedChange={(checked) => setEditingData({ ...editingData, is_quote: checked })}
                            />
                            <Label htmlFor="is_quote">Offerte</Label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                        <div>
                          <Badge className={getSizeTypeColor(pricing.size_type)}>
                            {pricing.size_type}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">
                            {pricing.employees_range}
                          </span>
                        </div>
                        <div>
                          <span className="text-lg font-semibold">
                            {pricing.price_display}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {pricing.is_popular && (
                            <Badge variant="default">Populair</Badge>
                          )}
                          {pricing.is_quote && (
                            <Badge variant="secondary">Offerte</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingId === pricing.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveChanges}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(pricing)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionItemsPricingManager;