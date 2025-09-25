import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Edit, Trash2, Plus, Tag, Copy, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DiscountCode {
  id: string;
  code: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order_amount: number;
  usage_limit?: number | null;
  used_count: number;
  active: boolean;
  applies_to: 'products' | 'memberships' | 'partners';
  starts_at: string;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

const DiscountCodeManager = () => {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const [newCode, setNewCode] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as 'percentage' | 'fixed_amount',
    discount_value: "",
    minimum_order_amount: "",
    usage_limit: "",
    applies_to: "products" as 'products' | 'memberships' | 'partners',
    active: true,
    expires_at: ""
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes((data || []).map(code => ({
        ...code,
        discount_type: code.discount_type as 'percentage' | 'fixed_amount',
        applies_to: code.applies_to as 'products' | 'memberships' | 'partners'
      })));
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      toast({
        title: "Fout",
        description: "Kon kortingscodes niet laden",
        variant: "destructive"
      });
    }
  };

  const filteredCodes = codes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (code.description && code.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddCode = async () => {
    try {
      if (!newCode.code.trim()) {
        toast({
          title: "Fout",
          description: "Kortingscode is verplicht",
          variant: "destructive"
        });
        return;
      }

      if (!newCode.discount_value || parseFloat(newCode.discount_value) <= 0) {
        toast({
          title: "Fout",
          description: "Voer een geldige kortingswaarde in",
          variant: "destructive"
        });
        return;
      }

      // Format expires_at properly for PostgreSQL
      let expiresAt = null;
      if (newCode.expires_at) {
        expiresAt = new Date(newCode.expires_at).toISOString();
      }

      const { error } = await supabase
        .from('discount_codes')
        .insert([{
          code: newCode.code.toUpperCase(),
          description: newCode.description || null,
          discount_type: newCode.discount_type,
          discount_value: newCode.discount_type === 'percentage' 
            ? parseInt(newCode.discount_value)
            : Math.round(parseFloat(newCode.discount_value) * 100), // Convert to cents for fixed amount
          minimum_order_amount: Math.round(parseFloat(newCode.minimum_order_amount || '0') * 100), // Convert to cents
          usage_limit: newCode.usage_limit ? parseInt(newCode.usage_limit) : null,
          applies_to: newCode.applies_to,
          active: newCode.active,
          expires_at: expiresAt
        }]);

      if (error) throw error;

      toast({
        title: "Toegevoegd",
        description: "Kortingscode is succesvol toegevoegd"
      });

      setNewCode({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        minimum_order_amount: "",
        usage_limit: "",
        applies_to: "products",
        active: true,
        expires_at: ""
      });
      setShowAddDialog(false);
      fetchCodes();
    } catch (error: any) {
      console.error('Error adding discount code:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === '23505') {
        toast({
          title: "Fout",
          description: "Deze kortingscode bestaat al",
          variant: "destructive"
        });
      } else if (error.message?.includes('violates check constraint')) {
        toast({
          title: "Fout", 
          description: "Ongeldige waarden. Controleer of alle velden correct zijn ingevuld.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Fout",
          description: `Kon kortingscode niet toevoegen: ${error.message || 'Onbekende fout'}`,
          variant: "destructive"
        });
      }
    }
  };

  const handleUpdateCode = async () => {
    if (!editingCode) return;

    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({
          code: editingCode.code.toUpperCase(),
          description: editingCode.description,
          discount_type: editingCode.discount_type,
          discount_value: editingCode.discount_value,
          minimum_order_amount: editingCode.minimum_order_amount,
          usage_limit: editingCode.usage_limit,
          applies_to: editingCode.applies_to,
          active: editingCode.active,
          expires_at: editingCode.expires_at
        })
        .eq('id', editingCode.id);

      if (error) throw error;

      toast({
        title: "Bijgewerkt",
        description: "Kortingscode is succesvol bijgewerkt"
      });

      setIsEditing(false);
      setEditingCode(null);
      fetchCodes();
    } catch (error) {
      console.error('Error updating discount code:', error);
      toast({
        title: "Fout",
        description: "Kon kortingscode niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze kortingscode wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Verwijderd",
        description: "Kortingscode is verwijderd"
      });

      fetchCodes();
    } catch (error) {
      console.error('Error deleting discount code:', error);
      toast({
        title: "Fout",
        description: "Kon kortingscode niet verwijderen",
        variant: "destructive"
      });
    }
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Gekopieerd",
      description: `Kortingscode ${code} is naar het klembord gekopieerd`
    });
  };

  const formatPrice = (priceInCents: number) => {
    return `€${(priceInCents / 100).toFixed(2)}`;
  };

  const formatDiscount = (code: DiscountCode) => {
    if (code.discount_type === 'percentage') {
      return `${code.discount_value}%`;
    } else {
      return formatPrice(code.discount_value);
    }
  };

  const getStatusBadge = (code: DiscountCode) => {
    if (!code.active) {
      return <Badge variant="secondary">Inactief</Badge>;
    }
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return <Badge variant="destructive">Verlopen</Badge>;
    }
    if (code.usage_limit && code.used_count >= code.usage_limit) {
      return <Badge variant="destructive">Opgebruikt</Badge>;
    }
    return <Badge variant="default">Actief</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Kortingscodes</h2>
          <p className="text-muted-foreground">Beheer kortingscodes voor de webshop</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Kortingscode Toevoegen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nieuwe Kortingscode</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Code</label>
                  <div className="flex gap-2">
                    <Input
                      value={newCode.code}
                      onChange={(e) => setNewCode({...newCode, code: e.target.value.toUpperCase()})}
                      placeholder="KORTINGSCODE"
                      className="uppercase"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewCode({...newCode, code: generateRandomCode()})}
                    >
                      Genereer
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Type korting</label>
                  <Select value={newCode.discount_type} onValueChange={(value) => setNewCode({...newCode, discount_type: value as 'percentage' | 'fixed_amount'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Vast bedrag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Beschrijving</label>
                <Textarea
                  value={newCode.description}
                  onChange={(e) => setNewCode({...newCode, description: e.target.value})}
                  placeholder="Beschrijving van de kortingscode"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Geldt voor</label>
                <Select value={newCode.applies_to} onValueChange={(value) => setNewCode({...newCode, applies_to: value as 'products' | 'memberships' | 'partners'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">Webshop Producten</SelectItem>
                    <SelectItem value="memberships">Lidmaatschappen</SelectItem>
                    <SelectItem value="partners">Partner Abonnementen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Kortingswaarde {newCode.discount_type === 'percentage' ? '(%)' : '(€)'}
                  </label>
                  <Input
                    type="number"
                    value={newCode.discount_value}
                    onChange={(e) => setNewCode({...newCode, discount_value: e.target.value})}
                    placeholder={newCode.discount_type === 'percentage' ? '10' : '5.00'}
                    step={newCode.discount_type === 'percentage' ? '1' : '0.01'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Minimum bestelbedrag (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newCode.minimum_order_amount}
                    onChange={(e) => setNewCode({...newCode, minimum_order_amount: e.target.value})}
                    placeholder="25.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Gebruikslimiet (optioneel)</label>
                  <Input
                    type="number"
                    value={newCode.usage_limit}
                    onChange={(e) => setNewCode({...newCode, usage_limit: e.target.value})}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Vervaldatum (optioneel)</label>
                  <Input
                    type="datetime-local"
                    value={newCode.expires_at}
                    onChange={(e) => setNewCode({...newCode, expires_at: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newCode.active}
                  onCheckedChange={(checked) => setNewCode({...newCode, active: checked})}
                />
                <label className="text-sm font-medium">Actief</label>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddCode} className="flex-1">
                  Kortingscode Toevoegen
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuleren
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Zoek kortingscodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Kortingscodes ({filteredCodes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Beschrijving</TableHead>
                  <TableHead>Geldt voor</TableHead>
                  <TableHead>Korting</TableHead>
                  <TableHead>Gebruikt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vervaldatum</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{code.code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCodeToClipboard(code.code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {code.description || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {code.applies_to === 'products' ? 'Webshop' : 
                         code.applies_to === 'memberships' ? 'Lidmaatschappen' : 
                         'Partners'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{formatDiscount(code)}</span>
                        {code.minimum_order_amount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Min. {formatPrice(code.minimum_order_amount)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{code.used_count}</span>
                        {code.usage_limit && (
                          <span className="text-muted-foreground">/ {code.usage_limit}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(code)}</TableCell>
                    <TableCell>
                      {code.expires_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(code.expires_at).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                      ) : (
                        'Geen'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCode(code);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCode(code.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {filteredCodes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Tag className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchTerm ? 'Geen kortingscodes gevonden voor je zoekopdracht.' : 'Nog geen kortingscodes aangemaakt.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                Voeg je eerste kortingscode toe
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kortingscode Bewerken</DialogTitle>
          </DialogHeader>
          {editingCode && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Code</label>
                  <Input
                    value={editingCode.code}
                    onChange={(e) => setEditingCode({...editingCode, code: e.target.value.toUpperCase()})}
                    className="uppercase"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type korting</label>
                  <Select value={editingCode.discount_type} onValueChange={(value) => setEditingCode({...editingCode, discount_type: value as 'percentage' | 'fixed_amount'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Vast bedrag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Beschrijving</label>
                <Textarea
                  value={editingCode.description || ''}
                  onChange={(e) => setEditingCode({...editingCode, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Kortingswaarde {editingCode.discount_type === 'percentage' ? '(%)' : '(€)'}
                  </label>
                  <Input
                    type="number"
                    value={editingCode.discount_type === 'percentage' ? editingCode.discount_value : (editingCode.discount_value / 100)}
                    onChange={(e) => setEditingCode({
                      ...editingCode, 
                      discount_value: editingCode.discount_type === 'percentage' 
                        ? parseInt(e.target.value) || 0
                        : Math.round(parseFloat(e.target.value) * 100) || 0
                    })}
                    step={editingCode.discount_type === 'percentage' ? '1' : '0.01'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Minimum bestelbedrag (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(editingCode.minimum_order_amount / 100).toFixed(2)}
                    onChange={(e) => setEditingCode({
                      ...editingCode, 
                      minimum_order_amount: Math.round(parseFloat(e.target.value) * 100) || 0
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Gebruikslimiet</label>
                  <Input
                    type="number"
                    value={editingCode.usage_limit || ''}
                    onChange={(e) => setEditingCode({
                      ...editingCode, 
                      usage_limit: e.target.value ? parseInt(e.target.value) : null
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Vervaldatum</label>
                  <Input
                    type="datetime-local"
                    value={editingCode.expires_at ? new Date(editingCode.expires_at).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingCode({
                      ...editingCode, 
                      expires_at: e.target.value || null
                    })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingCode.active}
                  onCheckedChange={(checked) => setEditingCode({...editingCode, active: checked})}
                />
                <label className="text-sm font-medium">Actief</label>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleUpdateCode} className="flex-1">
                  Opslaan
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
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

export default DiscountCodeManager;