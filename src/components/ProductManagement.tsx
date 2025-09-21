import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Edit, Trash2, Plus, Package, Euro, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number; // Price in cents
  image_url?: string | null;
  category?: string | null;
  in_stock: boolean;
  features: string[];
  created_at: string;
  updated_at: string;
}

interface ProductManagementProps {
  products: Product[];
  onProductsChange: () => void;
}

const ProductManagement = ({ products, onProductsChange }: ProductManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    in_stock: true,
    features: ""
  });

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "in_stock" && product.in_stock) ||
                        (stockFilter === "out_of_stock" && !product.in_stock);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const handleImageUpload = async (file: File, isEditing: boolean = false) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fout",
        description: "Selecteer een geldig afbeeldingsbestand",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fout", 
        description: "Afbeelding mag maximaal 5MB zijn",
        variant: "destructive"
      });
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('smb')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('smb')
        .getPublicUrl(filePath);

      if (isEditing && editingProduct) {
        setEditingProduct({
          ...editingProduct,
          image_url: publicUrl
        });
      } else {
        setNewProduct({
          ...newProduct,
          image_url: publicUrl
        });
      }

      toast({
        title: "Succesvol",
        description: "Afbeelding is geüpload"
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Fout",
        description: "Kon afbeelding niet uploaden",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      const featuresArray = newProduct.features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const { error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          description: newProduct.description || null,
          price: Math.round(parseFloat(newProduct.price) * 100), // Convert to cents
          image_url: newProduct.image_url || null,
          category: newProduct.category || null,
          in_stock: newProduct.in_stock,
          features: featuresArray
        }]);

      if (error) throw error;

      toast({
        title: "Toegevoegd",
        description: "Product is succesvol toegevoegd"
      });

      setNewProduct({
        name: "",
        description: "",
        price: "",
        image_url: "",
        category: "",
        in_stock: true,
        features: ""
      });
      setShowAddDialog(false);
      onProductsChange();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Fout",
        description: "Kon product niet toevoegen",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          image_url: editingProduct.image_url,
          category: editingProduct.category,
          in_stock: editingProduct.in_stock,
          features: editingProduct.features
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Bijgewerkt",
        description: "Product is succesvol bijgewerkt"
      });

      setIsEditing(false);
      setEditingProduct(null);
      onProductsChange();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Fout",
        description: "Kon product niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Verwijderd",
        description: "Product is verwijderd"
      });

      onProductsChange();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Fout",
        description: "Kon product niet verwijderen",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `€${(priceInCents / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">Beheer webshop producten</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Product Toevoegen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nieuw Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Naam</label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Product naam"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prijs (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="19.95"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Beschrijving</label>
                <Textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Product beschrijving"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categorie</label>
                  <Input
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    placeholder="Bijv. Kleding, Gereedschap"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Afbeelding</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                        placeholder="URL of upload afbeelding"
                        className="flex-1"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, false);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingImage}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingImage}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploadingImage ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                    {newProduct.image_url && (
                      <div className="relative w-20 h-20">
                        <img 
                          src={newProduct.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0"
                          onClick={() => setNewProduct({...newProduct, image_url: ""})}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Features (komma gescheiden)</label>
                <Input
                  value={newProduct.features}
                  onChange={(e) => setNewProduct({...newProduct, features: e.target.value})}
                  placeholder="Duurzaam, Waterproof, Verschillende maten"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in_stock"
                  checked={newProduct.in_stock}
                  onCheckedChange={(checked) => setNewProduct({...newProduct, in_stock: checked as boolean})}
                />
                <label htmlFor="in_stock" className="text-sm font-medium">Op voorraad</label>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddProduct} className="flex-1">
                  Product Toevoegen
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuleren
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek producten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Alle categorieën" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle categorieën</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Voorraad status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle producten</SelectItem>
            <SelectItem value="in_stock">Op voorraad</SelectItem>
            <SelectItem value="out_of_stock">Uitverkocht</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Producten ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead>Prijs</TableHead>
                  <TableHead>Voorraad</TableHead>
                  <TableHead>Aangemaakt</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.category && (
                        <Badge variant="secondary">{product.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.in_stock ? "default" : "destructive"}>
                        {product.in_stock ? "Op voorraad" : "Uitverkocht"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(product.created_at).toLocaleDateString('nl-NL')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Bewerken</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Naam</label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prijs (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(editingProduct.price / 100).toFixed(2)}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct, 
                      price: Math.round(parseFloat(e.target.value) * 100)
                    })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Beschrijving</label>
                <Textarea
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categorie</label>
                  <Input
                    value={editingProduct.category || ""}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Afbeelding</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={editingProduct.image_url || ""}
                        onChange={(e) => setEditingProduct({...editingProduct, image_url: e.target.value})}
                        placeholder="URL of upload afbeelding"
                        className="flex-1"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, true);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingImage}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingImage}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploadingImage ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                    {editingProduct.image_url && (
                      <div className="relative w-20 h-20">
                        <img 
                          src={editingProduct.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0"
                          onClick={() => setEditingProduct({...editingProduct, image_url: ""})}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Features (komma gescheiden)</label>
                <Input
                  value={editingProduct.features.join(', ')}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct, 
                    features: e.target.value.split(',').map(f => f.trim()).filter(f => f.length > 0)
                  })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_in_stock"
                  checked={editingProduct.in_stock}
                  onCheckedChange={(checked) => setEditingProduct({...editingProduct, in_stock: checked as boolean})}
                />
                <label htmlFor="edit_in_stock" className="text-sm font-medium">Op voorraad</label>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleUpdateProduct} className="flex-1">
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

export default ProductManagement;
