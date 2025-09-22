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
import { Search, Users, CreditCard, Edit, Trash2, Download, Filter, Eye, Save, Home, ShoppingBag, Building2, Plus, Globe, Mail, Phone, Package, Printer, CheckCircle, Euro, Tag, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import CompanyProfileForm from "@/components/CompanyProfileForm";
import ProductManagement from "@/components/ProductManagement";
import PartnerAccountManagement from "@/components/PartnerAccountManagement";
import MembershipPricingManager from "@/components/MembershipPricingManager";
import DiscountCodeManager from "@/components/DiscountCodeManager";
import PartnerPricingManager from "@/components/PartnerPricingManager";

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

interface PartnerAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  description: string | null;
  payment_status: string;
  amount: number;
  created_at: string;
  user_id: string | null;
  company_profile: CompanyProfile | null;
  generated_password?: string;
  account_created?: boolean;
}

const Dashboard = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [partners, setPartners] = useState<PartnerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'memberships' | 'orders' | 'profiles' | 'products' | 'partners' | 'pricing' | 'partner-pricing' | 'discounts'>("memberships");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null);
  const [editingPartner, setEditingPartner] = useState<PartnerAccount | null>(null);
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [showUserIdDialog, setShowUserIdDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerAccount | null>(null);
  const [userIdInput, setUserIdInput] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [creatingTestOrder, setCreatingTestOrder] = useState(false);
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
      await Promise.all([fetchMemberships(), fetchOrders(), fetchProfiles(), fetchProducts(), fetchPartners()]);
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

  const fetchProducts = async () => {
    try {
      console.log('🔄 Fetching products...');
      // Use any type to bypass TypeScript error for products table
      const { data, error } = await (supabase as any)
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Products fetch error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code === '42P01') {
          console.error('💡 Products table does not exist - need to run migration');
          toast({
            title: "Database Setup Vereist",
            description: "Products tabel bestaat nog niet. Voer eerst de database migration uit in Supabase SQL Editor.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Database Fout",
            description: `${error.message} (Code: ${error.code})`,
            variant: "destructive"
          });
        }
        setProducts([]);
        return;
      }

      console.log('✅ Products fetched successfully:', data);
      console.log(`📦 Total products: ${data?.length || 0}`);
      
      // Transform data to match Product interface
      const transformedProducts: Product[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        category: item.category,
        in_stock: item.in_stock,
        features: item.features || [],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('💥 Unexpected error fetching products:', error);
      toast({
        title: "Onverwachte Fout",
        description: "Er ging iets mis bij het laden van producten",
        variant: "destructive"
      });
      setProducts([]);
    }
  };

  const fetchPartners = async () => {
    try {
      console.log('🔄 Fetching partners...');
      const { data, error } = await supabase
        .from('partner_memberships')
        .select(`
          *,
          company_profiles (
            id,
            name,
            description,
            website,
            logo_url,
            industry,
            contact_email,
            contact_phone,
            is_featured,
            display_order,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Partners fetch error:', error);
        toast({
          title: "Database Fout",
          description: `${error.message} (Code: ${error.code})`,
          variant: "destructive"
        });
        setPartners([]);
        return;
      }

      console.log('✅ Partners fetched successfully:', data);
      console.log(`🤝 Total partners: ${data?.length || 0}`);
      
      // Transform data to match PartnerAccount interface
      const transformedPartners: PartnerAccount[] = (data || []).map((item: any) => ({
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        email: item.email,
        phone: item.phone || '',
        company_name: item.company_name,
        website: item.website,
        industry: item.industry,
        description: item.description,
        payment_status: item.payment_status,
        amount: item.amount,
        created_at: item.created_at,
        user_id: item.user_id,
        company_profile: item.company_profiles?.[0] || null,
        generated_password: item.generated_password || null,
        account_created: item.account_created || false
      }));
      
      setPartners(transformedPartners);
    } catch (error) {
      console.error('💥 Unexpected error fetching partners:', error);
      toast({
        title: "Onverwachte Fout",
        description: "Er ging iets mis bij het laden van partners",
        variant: "destructive"
      });
      setPartners([]);
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

  const testEmail = async () => {
    setTestingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-email', {
        body: {}
      });

      if (error) throw error;

      console.log('Test email response:', data);
      toast({
        title: "Test Email Verzonden",
        description: "Test bestelbevestiging is verzonden naar info@bouwmetrespect.nl",
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Fout",
        description: "Kon test email niet verzenden: " + (error as any)?.message,
        variant: "destructive"
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const createTestOrder = async () => {
    setCreatingTestOrder(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-test-order');

      if (error) throw error;

      console.log('Test order response:', data);
      toast({
        title: "Test Bestelling Aangemaakt",
        description: "Test bestelling is aangemaakt en bevestigingsemail is verzonden naar info@bouwmetrespect.nl",
      });
      
      // Refresh orders to show the new test order
      await fetchOrders();
    } catch (error) {
      console.error('Error creating test order:', error);
      toast({
        title: "Fout",
        description: "Kon test bestelling niet aanmaken: " + (error as any)?.message,
        variant: "destructive"
      });
    } finally {
      setCreatingTestOrder(false);
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

  const printOrderDetails = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const orderDate = new Date(order.created_at).toLocaleDateString('nl-NL');
    const orderTime = new Date(order.created_at).toLocaleTimeString('nl-NL');
    
    // Handle items correctly - they might already be parsed from JSONB
    let items = [];
    try {
      items = Array.isArray(order.items) ? order.items : 
              typeof order.items === 'string' ? JSON.parse(order.items) : 
              order.items ? [order.items] : [];
    } catch (e) {
      console.error('Error parsing order items:', e);
      items = [];
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bestelling ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #2563eb; margin-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-item { margin-bottom: 8px; }
          .label { font-weight: bold; color: #374151; }
          .value { color: #6b7280; }
          .status { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
          .status-paid { background-color: #dcfce7; color: #166534; }
          .status-pending { background-color: #fef3c7; color: #92400e; }
          .status-failed { background-color: #fee2e2; color: #991b1b; }
          .products { margin-top: 20px; }
          .product-item { border: 1px solid #e5e7eb; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
          .total { font-size: 18px; font-weight: bold; color: #2563eb; margin-top: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Bestelling Details</h1>
          <p><strong>Bestelling ID:</strong> ${order.id}</p>
          <p><strong>Datum:</strong> ${orderDate} om ${orderTime}</p>
        </div>

        <div class="section">
          <h3>Klantgegevens</h3>
          <div class="info-grid">
            <div>
              <div class="info-item">
                <span class="label">Naam:</span>
                <span class="value">${order.customer_first_name || ''} ${order.customer_last_name || ''}</span>
              </div>
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">${order.customer_email || order.email || 'Niet opgegeven'}</span>
              </div>
              <div class="info-item">
                <span class="label">Telefoon:</span>
                <span class="value">${order.customer_phone || 'Niet opgegeven'}</span>
              </div>
            </div>
            <div>
              <div class="info-item">
                <span class="label">Status:</span>
                <span class="status status-${order.payment_status}">${order.payment_status === 'paid' ? 'Betaald' : order.payment_status === 'pending' ? 'In Behandeling' : 'Mislukt'}</span>
              </div>
              <div class="info-item">
                <span class="label">Totaal:</span>
                <span class="value">€${(order.total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Verzendadres</h3>
          <div class="info-item">
            <span class="label">Straat:</span>
            <span class="value">${order.address_street || 'Niet opgegeven'} ${order.address_house_number || ''}</span>
          </div>
          <div class="info-item">
            <span class="label">Postcode & Plaats:</span>
            <span class="value">${order.address_postcode || 'Niet opgegeven'} ${order.address_city || 'Niet opgegeven'}</span>
          </div>
          <div class="info-item">
            <span class="label">Land:</span>
            <span class="value">${order.address_country || 'Nederland'}</span>
          </div>
        </div>

        <div class="section products">
          <h3>Bestelde Producten</h3>
          ${items.length > 0 ? items.map((item: any) => `
            <div class="product-item">
              <div><strong>${item.name || 'Onbekend product'}</strong></div>
              <div>Prijs: €${((item.price || 0) / 100).toFixed(2)}</div>
              <div>Aantal: ${item.quantity || 1}</div>
              <div>Subtotaal: €${(((item.price || 0) * (item.quantity || 1)) / 100).toFixed(2)}</div>
            </div>
          `).join('') : '<p>Geen producten gevonden</p>'}
        </div>

        <div class="total">
          Totaalbedrag: €${(order.total / 100).toFixed(2)}
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status bijgewerkt",
        description: "Bestelling status is succesvol gewijzigd",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Fout",
        description: "Kon de bestelling status niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (confirm('Weet je zeker dat je deze bestelling wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (error) throw error;

        toast({
          title: "Bestelling verwijderd",
          description: "De bestelling is succesvol verwijderd",
        });

        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        toast({
          title: "Fout",
          description: "Kon de bestelling niet verwijderen",
          variant: "destructive",
        });
      }
    }
  };

  const processOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'processed' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Bestelling verwerkt",
        description: "De bestelling is gemarkeerd als verwerkt",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Fout",
        description: "Kon de bestelling niet verwerken",
        variant: "destructive",
      });
    }
  };

  const editOrder = (order: Order) => {
    setEditingOrder(order);
    setIsEditingOrder(true);
  };

  const updateOrder = async () => {
    if (!editingOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          customer_first_name: editingOrder.customer_first_name,
          customer_last_name: editingOrder.customer_last_name,
          customer_email: editingOrder.customer_email,
          customer_phone: editingOrder.customer_phone,
          address_street: editingOrder.address_street,
          address_house_number: editingOrder.address_house_number,
          address_postcode: editingOrder.address_postcode,
          address_city: editingOrder.address_city,
          address_country: editingOrder.address_country,
          payment_status: editingOrder.payment_status,
          subtotal: editingOrder.subtotal,
          shipping: editingOrder.shipping,
          total: editingOrder.total
        })
        .eq('id', editingOrder.id);

      if (error) throw error;

      toast({
        title: "Bestelling bijgewerkt",
        description: "De bestelling is succesvol bijgewerkt",
      });

      setIsEditingOrder(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Fout",
        description: "Kon de bestelling niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const createPartnerAccount = async (partner: PartnerAccount) => {
    try {
      // Generate random password
      const password = generateRandomPassword();
      
      // Note: Cannot create user account from frontend - requires admin privileges
      // For now, just generate password and show instructions
      console.log('Note: User account creation requires admin privileges. Please create manually from Supabase Dashboard.');
      
      // Generate password and show instructions
      const updatedPartner = {
        ...partner,
        generated_password: password
      };

      // Update the partner in state
      setPartners(prevPartners => 
        prevPartners.map(p => 
          p.id === partner.id ? updatedPartner : p
        )
      );

      toast({
        title: "Wachtwoord Gegenereerd",
        description: `Wachtwoord is gegenereerd voor ${partner.company_name}. Maak handmatig een account aan in Supabase en koppel de User ID.`,
        duration: 8000
      });

      // Copy account details to clipboard
      const accountDetails = `
Account Details voor ${partner.company_name}:

Email: ${partner.email}
Wachtwoord: ${password}
Bedrijf: ${partner.company_name}

Stappen:
1. Ga naar Supabase Dashboard &gt; Authentication &gt; Users
2. Klik "Add user" 
3. Voer email en wachtwoord in
4. Kopieer de User ID
5. Klik "🔗 User ID Koppelen" in de dashboard
6. Plak de User ID en klik "Koppelen"
      `;

      await navigator.clipboard.writeText(accountDetails);

      // Send welcome email
      await sendPartnerWelcomeEmail(partner.email, partner.first_name, password, partner.company_name);

      return; // Exit early since we can't create the account automatically


    } catch (error: any) {
      console.error('Error creating partner account:', error);
      toast({
        title: "Fout",
        description: `Kon account niet aanmaken: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Gekopieerd",
        description: `${label} is gekopieerd naar clipboard`,
        duration: 2000
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Fout",
        description: `Kon ${label} niet kopiëren`,
        variant: "destructive"
      });
    }
  };

  const linkUserId = async () => {
    if (!selectedPartner || !userIdInput.trim()) {
      toast({
        title: "Fout",
        description: "Voer een geldige User ID in",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('partner_memberships')
        .update({ user_id: userIdInput.trim() })
        .eq('id', selectedPartner.id);

      if (error) {
        throw error;
      }

      // Update local state
      setPartners(prevPartners => 
        prevPartners.map(p => 
          p.id === selectedPartner.id ? { ...p, user_id: userIdInput.trim() } : p
        )
      );

      toast({
        title: "User ID Gekoppeld",
        description: `User ID is succesvol gekoppeld aan ${selectedPartner.company_name}`,
        duration: 3000
      });

      setShowUserIdDialog(false);
      setSelectedPartner(null);
      setUserIdInput('');

    } catch (error: any) {
      console.error('Error linking user ID:', error);
      toast({
        title: "Fout",
        description: `Kon User ID niet koppelen: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const updatePartner = async (updatedPartner: PartnerAccount) => {
    try {
      console.log('🔄 Updating partner:', updatedPartner.id);
      console.log('📝 Updated data:', updatedPartner);
      
      // Update partner membership
      const { error: partnerError } = await supabase
        .from('partner_memberships')
        .update({
          first_name: updatedPartner.first_name,
          last_name: updatedPartner.last_name,
          email: updatedPartner.email,
          phone: updatedPartner.phone,
          company_name: updatedPartner.company_name,
          website: updatedPartner.website,
          industry: updatedPartner.industry,
          description: updatedPartner.description,
          payment_status: updatedPartner.payment_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedPartner.id);

      if (partnerError) {
        console.error('❌ Partner update error:', partnerError);
        throw partnerError;
      }

      console.log('✅ Partner updated successfully');

      // Update company profile if it exists
      if (updatedPartner.company_profile) {
        const { error: profileError } = await supabase
          .from('company_profiles')
          .update({
            name: updatedPartner.company_name,
            description: updatedPartner.description || `Welkom bij ${updatedPartner.company_name}`,
            website: updatedPartner.website,
            industry: updatedPartner.industry || 'Bouw & Constructie',
            contact_email: updatedPartner.email,
            contact_phone: updatedPartner.phone || '',
            updated_at: new Date().toISOString()
          })
          .eq('partner_membership_id', updatedPartner.id);

        if (profileError) {
          console.error('Error updating company profile:', profileError);
          // Don't fail the entire operation
        }
      }
      
      await fetchPartners();
      setIsEditingPartner(false);
      setEditingPartner(null);
      toast({
        title: "Bijgewerkt",
        description: "Partner gegevens en bedrijfsprofiel zijn succesvol bijgewerkt"
      });
    } catch (error: any) {
      console.error('Error updating partner:', error);
      toast({
        title: "Fout",
        description: `Kon partner niet bijwerken: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const generateRandomPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const deletePartnerAccount = async (partner: PartnerAccount) => {
    try {
      // Delete company profile first
      if (partner.company_profile) {
        const { error: profileError } = await supabase
          .from('company_profiles')
          .delete()
          .eq('partner_membership_id', partner.id);

        if (profileError) {
          console.error('Error deleting company profile:', profileError);
        }
      }

      // Delete partner membership
      const { error: deleteError } = await supabase
        .from('partner_memberships')
        .delete()
        .eq('id', partner.id);

      if (deleteError) {
        throw deleteError;
      }

      // Refresh partners list
      await fetchPartners();

      toast({
        title: "Partner Verwijderd",
        description: `${partner.company_name} is succesvol verwijderd uit de database`,
        duration: 3000
      });

      // Note about manual user deletion
      if (partner.user_id) {
        toast({
          title: "Let op",
          description: "Vergeet niet om het gebruikersaccount handmatig te verwijderen uit Supabase Authentication",
          duration: 5000
        });
      }

    } catch (error: any) {
      console.error('Error deleting partner account:', error);
      toast({
        title: "Fout",
        description: `Kon partner niet verwijderen: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const createNewPartnerAccount = async () => {
    try {
      console.log('🔄 Creating new partner account...');
      
      const newPartner = {
        first_name: 'Nieuwe',
        last_name: 'Partner',
        email: 'nieuwe@partner.nl',
        phone: '',
        company_name: 'Nieuwe Partner Bedrijf',
        website: '',
        industry: 'Bouw & Constructie',
        description: 'Nieuwe partner - gegevens nog in te vullen',
        payment_status: 'pending',
        amount: 0,
        company_size: 'klein'
      };

      console.log('📝 Partner data:', newPartner);

      // Create partner membership first
      const { data: partnerData, error: partnerError } = await supabase
        .from('partner_memberships')
        .insert({
          first_name: newPartner.first_name,
          last_name: newPartner.last_name,
          email: newPartner.email,
          phone: newPartner.phone,
          company_name: newPartner.company_name,
          website: newPartner.website,
          industry: newPartner.industry,
          description: newPartner.description,
          payment_status: newPartner.payment_status,
          amount: newPartner.amount,
          company_size: newPartner.company_size
        })
        .select()
        .single();

      if (partnerError) {
        console.error('❌ Partner creation error:', partnerError);
        throw partnerError;
      }

      console.log('✅ Partner created successfully:', partnerData);

      // Refresh partners list
      await fetchPartners();

      toast({
        title: "Nieuwe Partner Toegevoegd",
        description: "Je kunt nu de partner gegevens bewerken via de 'Bewerken' knop",
        duration: 3000
      });

    } catch (error: any) {
      console.error('💥 Error creating new partner:', error);
      toast({
        title: "Fout",
        description: `Kon nieuwe partner niet aanmaken: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const updatePartnerCredentials = async (partner: PartnerAccount, newEmail: string, newPassword: string) => {
    try {
      // Update email in partner_memberships
      const { error: partnerError } = await supabase
        .from('partner_memberships')
        .update({ 
          email: newEmail,
          generated_password: newPassword || partner.generated_password
        })
        .eq('id', partner.id);

      if (partnerError) {
        throw partnerError;
      }

      // Update company profile email
      if (partner.company_profile) {
        const { error: profileError } = await supabase
          .from('company_profiles')
          .update({ contact_email: newEmail })
          .eq('partner_membership_id', partner.id);

        if (profileError) {
          console.error('Error updating company profile email:', profileError);
        }
      }

      // Refresh partners list
      await fetchPartners();

      toast({
        title: "Gegevens Bijgewerkt",
        description: `Email en wachtwoord voor ${partner.company_name} zijn bijgewerkt in de database`,
        duration: 3000
      });

      // Note about manual user update
      if (partner.user_id) {
        toast({
          title: "Let op",
          description: "Vergeet niet om de gebruikersgegevens handmatig bij te werken in Supabase Authentication",
          duration: 5000
        });
      }

    } catch (error: any) {
      console.error('Error updating partner credentials:', error);
      toast({
        title: "Fout",
        description: `Kon gegevens niet bijwerken: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const sendPartnerWelcomeEmail = async (email: string, firstName: string, password: string, companyName: string) => {
    try {
      // Create email content and copy to clipboard
      const emailContent = `
Beste ${firstName},

Welkom bij Bouw met Respect! Je partner account is succesvol aangemaakt.

Je inloggegevens:
- Email: ${email}
- Wachtwoord: ${password}
- Bedrijf: ${companyName}

Je kunt nu inloggen op je Partner Dashboard:
https://bouwmetrespect.nl/partner-dashboard

Voor vragen kun je altijd contact met ons opnemen.

Met vriendelijke groet,
Het Bouw met Respect team
      `;
      
      await navigator.clipboard.writeText(emailContent);
      console.log('Email content copied to clipboard');
      
    } catch (error) {
      console.error('Error preparing email content:', error);
    }
  };

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
    : viewMode === 'profiles'
    ? {
        total: profiles.length,
        paid: profiles.filter(p => p.is_featured).length,
        pending: profiles.filter(p => !p.is_featured).length,
        revenue: 0
      }
    : viewMode === 'products'
    ? {
        total: products.length,
        paid: products.filter(p => p.in_stock).length,
        pending: products.filter(p => !p.in_stock).length,
        revenue: products.reduce((sum, p) => sum + p.price, 0)
      }
    : {
        total: partners.length,
        paid: partners.filter(p => p.payment_status === 'paid').length,
        pending: partners.filter(p => p.payment_status === 'pending').length,
        revenue: partners
          .filter(p => p.payment_status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0)
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
            <Button 
              onClick={testEmail} 
              disabled={testingEmail}
              className="flex items-center gap-2 w-full sm:w-auto"
              variant="outline"
            >
              <Mail className="w-4 h-4" />
              {testingEmail ? "Verzenden..." : "Test Email"}
            </Button>
            <Button 
              onClick={createTestOrder} 
              disabled={creatingTestOrder}
              className="flex items-center gap-2 w-full sm:w-auto"
              variant="secondary"
            >
              <ShoppingBag className="w-4 h-4" />
              {creatingTestOrder ? "Aanmaken..." : "Test Bestelling"}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-6">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'memberships' | 'orders' | 'profiles' | 'products' | 'partners' | 'pricing' | 'partner-pricing' | 'discounts')}>
            <div className="space-y-4">
              {/* Gebruikers & Data Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Gebruikers & Data</h3>
                <TabsList className="inline-flex h-auto p-1 space-x-1 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-lg">
                  <TabsTrigger 
                    value="memberships" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
                  >
                    <Users className="w-4 h-4" />
                    <span>Lidmaatschappen</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="profiles" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Bedrijven</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="partners" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Partners</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Webshop Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Webshop</h3>
                <TabsList className="inline-flex h-auto p-1 space-x-1 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-lg">
                  <TabsTrigger 
                    value="orders" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Bestellingen</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="products" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
                  >
                    <Package className="w-4 h-4" />
                    <span>Producten</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="discounts" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Kortingen</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Configuratie Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Configuratie</h3>
                <TabsList className="inline-flex h-auto p-1 space-x-1 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-lg">
                  <TabsTrigger 
                    value="pricing" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
                  >
                    <Euro className="w-4 h-4" />
                    <span>Lidmaatschap Prijzen</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="partner-pricing" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Partner Prijzen</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {viewMode === 'memberships' ? 'Totaal Leden' : 
                 viewMode === 'orders' ? 'Totaal Bestellingen' : 
                 viewMode === 'profiles' ? 'Totaal Bedrijven' : 
                 viewMode === 'products' ? 'Totaal Producten' : 
                 viewMode === 'partners' ? 'Totaal Partners' :
                 viewMode === 'discounts' ? 'Totaal Kortingscodes' :
                 'Lidmaatschaps Prijzen'}
              </CardTitle>
              {viewMode === 'memberships' ? (
                <Users className="w-4 h-4 text-muted-foreground" />
              ) : viewMode === 'orders' ? (
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              ) : viewMode === 'profiles' ? (
                <Building2 className="w-4 h-4 text-muted-foreground" />
              ) : viewMode === 'products' ? (
                <Package className="w-4 h-4 text-muted-foreground" />
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
                {viewMode === 'profiles' ? 'Featured' : viewMode === 'products' ? 'Op voorraad' : viewMode === 'partners' ? 'Actief' : 'Betaald'}
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
                {viewMode === 'profiles' ? 'Regulier' : viewMode === 'products' ? 'Uitverkocht' : viewMode === 'partners' ? 'In Behandeling' : 'In Behandeling'}
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
                {viewMode === 'profiles' ? '-' : viewMode === 'products' ? formatPrice(stats.revenue) : formatPrice(stats.revenue)}
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
                    <TableHead className="min-w-[100px]">Acties</TableHead>
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
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => printOrderDetails(order)}
                            className="flex items-center gap-1"
                          >
                            <Printer className="w-4 h-4" />
                            Print
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editOrder(order)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Bewerk
                          </Button>
                          {order.payment_status === 'paid' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => processOrder(order.id)}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Verwerk
                            </Button>
                          )}
                          <Select
                            value={order.payment_status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-24 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Betaald</SelectItem>
                              <SelectItem value="processed">Verwerkt</SelectItem>
                              <SelectItem value="shipped">Verzonden</SelectItem>
                              <SelectItem value="delivered">Geleverd</SelectItem>
                              <SelectItem value="cancelled">Geannuleerd</SelectItem>
                              <SelectItem value="refunded">Terugbetaald</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteOrder(order.id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Verwijder
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
                              <CardTitle className="text-xl font-semibold">{profile.name}</CardTitle>
                              {profile.industry && (
                                <Badge variant="secondary" className="mt-2 text-sm">
                                  {profile.industry}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {profile.is_featured && (
                            <Badge className="bg-yellow-500 text-white">Uitgelicht</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {profile.description && (
                          <CardDescription className="mb-4 line-clamp-3 text-sm text-gray-600">
                            {profile.description}
                          </CardDescription>
                        )}
                        
                        <div className="space-y-3 mb-4">
                          {profile.website && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Globe className="w-4 h-4 text-primary" />
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
                              <Mail className="w-4 h-4 text-primary" />
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
                              <Phone className="w-4 h-4 text-primary" />
                              <a
                                href={`tel:${profile.contact_phone}`}
                                className="hover:text-primary"
                              >
                                {profile.contact_phone}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProfile(profile)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="w-4 h-4 mr-2" /> Bewerken
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Verwijderen
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

        {/* Products Section */}
        {viewMode === 'products' && (
          <ProductManagement 
            products={products} 
            onProductsChange={fetchProducts}
          />
        )}

        {/* Partners Section */}
        {viewMode === 'partners' && (
          <PartnerAccountManagement />
        )}

        {/* Pricing Section */}
        {viewMode === 'pricing' && (
          <MembershipPricingManager />
        )}

        {/* Discounts Section */}
        {viewMode === 'discounts' && (
          <DiscountCodeManager />
        )}

        {/* Partner Pricing Section */}
        {viewMode === 'partner-pricing' && (
          <PartnerPricingManager />
        )}

        <CompanyProfileForm
          open={showProfileForm}
          onOpenChange={handleProfileFormClose}
          onSuccess={handleProfileFormSuccess}
          editingProfile={editingProfile}
        />

        {/* Order Edit Dialog */}
        <Dialog open={isEditingOrder} onOpenChange={setIsEditingOrder}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bestelling Bewerken</DialogTitle>
            </DialogHeader>
            {editingOrder && (
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Klantgegevens</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Voornaam</label>
                      <Input
                        value={editingOrder.customer_first_name || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, customer_first_name: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Achternaam</label>
                      <Input
                        value={editingOrder.customer_last_name || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, customer_last_name: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <Input
                        type="email"
                        value={editingOrder.customer_email || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, customer_email: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefoon</label>
                      <Input
                        value={editingOrder.customer_phone || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, customer_phone: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Adresgegevens</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Straat</label>
                      <Input
                        value={editingOrder.address_street || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, address_street: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Huisnummer</label>
                      <Input
                        value={editingOrder.address_house_number || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, address_house_number: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Postcode</label>
                      <Input
                        value={editingOrder.address_postcode || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, address_postcode: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Plaats</label>
                      <Input
                        value={editingOrder.address_city || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, address_city: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Land</label>
                      <Input
                        value={editingOrder.address_country || 'Nederland'}
                        onChange={(e) => setEditingOrder({...editingOrder, address_country: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Bestelgegevens</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Subtotaal (cent)</label>
                      <Input
                        type="number"
                        value={editingOrder.subtotal}
                        onChange={(e) => setEditingOrder({...editingOrder, subtotal: parseInt(e.target.value) || 0})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Verzendkosten (cent)</label>
                      <Input
                        type="number"
                        value={editingOrder.shipping}
                        onChange={(e) => setEditingOrder({...editingOrder, shipping: parseInt(e.target.value) || 0})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Totaal (cent)</label>
                      <Input
                        type="number"
                        value={editingOrder.total}
                        onChange={(e) => setEditingOrder({...editingOrder, total: parseInt(e.target.value) || 0})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Betaalstatus</h3>
                  <Select 
                    value={editingOrder.payment_status} 
                    onValueChange={(value) => setEditingOrder({...editingOrder, payment_status: value})}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Betaald</SelectItem>
                      <SelectItem value="processed">Verwerkt</SelectItem>
                      <SelectItem value="shipped">Verzonden</SelectItem>
                      <SelectItem value="delivered">Geleverd</SelectItem>
                      <SelectItem value="cancelled">Geannuleerd</SelectItem>
                      <SelectItem value="refunded">Terugbetaald</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsEditingOrder(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={updateOrder}>
                    <Save className="w-4 h-4 mr-2" />
                    Opslaan
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Partner Edit Dialog */}
        <Dialog open={isEditingPartner} onOpenChange={setIsEditingPartner}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Partner Bewerken</DialogTitle>
            </DialogHeader>
            {editingPartner && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Persoonlijke Gegevens</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Voornaam</label>
                      <Input
                        value={editingPartner.first_name}
                        onChange={(e) => setEditingPartner({...editingPartner, first_name: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Achternaam</label>
                      <Input
                        value={editingPartner.last_name}
                        onChange={(e) => setEditingPartner({...editingPartner, last_name: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <Input
                        type="email"
                        value={editingPartner.email}
                        onChange={(e) => setEditingPartner({...editingPartner, email: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefoon</label>
                      <Input
                        value={editingPartner.phone}
                        onChange={(e) => setEditingPartner({...editingPartner, phone: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Bedrijfsgegevens</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bedrijfsnaam</label>
                      <Input
                        value={editingPartner.company_name}
                        onChange={(e) => setEditingPartner({...editingPartner, company_name: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <Input
                        value={editingPartner.website || ''}
                        onChange={(e) => setEditingPartner({...editingPartner, website: e.target.value})}
                        className="mt-1"
                        placeholder="https://www.voorbeeld.nl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Branche</label>
                      <Input
                        value={editingPartner.industry || ''}
                        onChange={(e) => setEditingPartner({...editingPartner, industry: e.target.value})}
                        className="mt-1"
                        placeholder="Bouw & Constructie"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Select
                        value={editingPartner.payment_status}
                        onValueChange={(value) => setEditingPartner({...editingPartner, payment_status: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">In Behandeling</SelectItem>
                          <SelectItem value="paid">Betaald</SelectItem>
                          <SelectItem value="failed">Mislukt</SelectItem>
                          <SelectItem value="expired">Verlopen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-muted-foreground">Beschrijving</label>
                    <Textarea
                      value={editingPartner.description || ''}
                      onChange={(e) => setEditingPartner({...editingPartner, description: e.target.value})}
                      className="mt-1"
                      rows={3}
                      placeholder="Beschrijf het bedrijf..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingPartner(false);
                      setEditingPartner(null);
                    }}
                  >
                    Annuleren
                  </Button>
                  <Button
                    onClick={() => updatePartner(editingPartner)}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Opslaan
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* User ID Link Dialog */}
        <Dialog open={showUserIdDialog} onOpenChange={setShowUserIdDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>User ID Koppelen</DialogTitle>
            </DialogHeader>
            {selectedPartner && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Koppel de User ID van het aangemaakte account aan <strong>{selectedPartner.company_name}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Ga naar Supabase Dashboard &gt; Authentication &gt; Users om de User ID te vinden
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <Input
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="Voer de User ID in..."
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUserIdDialog(false);
                      setSelectedPartner(null);
                      setUserIdInput('');
                    }}
                  >
                    Annuleren
                  </Button>
                  <Button
                    onClick={linkUserId}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Koppelen
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Account Verwijderen</DialogTitle>
            </DialogHeader>
            {selectedPartner && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Weet je zeker dat je het account voor <strong>{selectedPartner.company_name}</strong> wilt verwijderen?
                  </p>
                  <p className="text-xs text-red-600 mb-4">
                    ⚠️ Deze actie kan niet ongedaan worden gemaakt. Het account wordt permanent verwijderd uit Supabase Authentication.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setSelectedPartner(null);
                    }}
                  >
                    Annuleren
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (selectedPartner) {
                        await deletePartnerAccount(selectedPartner);
                        setShowDeleteDialog(false);
                        setSelectedPartner(null);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Verwijderen
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Credentials Dialog */}
        <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Inloggegevens Bewerken</DialogTitle>
            </DialogHeader>
            {selectedPartner && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bewerk de inloggegevens voor <strong>{selectedPartner.company_name}</strong>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nieuwe Email</label>
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Voer nieuwe email in..."
                    className="mt-1"
                    type="email"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nieuw Wachtwoord</label>
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Voer nieuw wachtwoord in..."
                    className="mt-1"
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Laat leeg om wachtwoord niet te wijzigen
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCredentialsDialog(false);
                      setSelectedPartner(null);
                      setNewEmail('');
                      setNewPassword('');
                    }}
                  >
                    Annuleren
                  </Button>
                  <Button
                    onClick={async () => {
                      if (selectedPartner && newEmail) {
                        const password = newPassword || generateRandomPassword();
                        await updatePartnerCredentials(selectedPartner, newEmail, password);
                        setShowCredentialsDialog(false);
                        setSelectedPartner(null);
                        setNewEmail('');
                        setNewPassword('');
                      }
                    }}
                    className="flex items-center gap-2"
                    disabled={!newEmail}
                  >
                    <Save className="w-4 h-4" />
                    Bijwerken
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;