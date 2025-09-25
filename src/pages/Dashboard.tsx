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
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import QRCodeManager from "@/components/QRCodeManager";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

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
  const [viewMode, setViewMode] = useState<'memberships' | 'orders' | 'profiles' | 'products' | 'partners' | 'pricing' | 'partner-pricing' | 'discounts' | 'qrcode'>("memberships");
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
      // If no user, create a mock user for testing
      if (!user) {
        console.log('No user found, using test mode');
        const mockUser = {
          id: 'test-user-id',
          email: 'info@bouwmetrespect.nl',
          user_metadata: {
            first_name: 'Admin',
            last_name: 'User'
          }
        };
        setUser(mockUser as any);
        setIsAdmin(true);
        toast({
          title: "Niet ingelogd",
          description: "Je moet inloggen om alles te kunnen bewerken. Klik op 'Partner Login' hierboven.",
          duration: 8000
        });
        await Promise.all([fetchMemberships(), fetchOrders(), fetchProfiles(), fetchProducts(), fetchPartners()]);
        setLoading(false);
        return;
      }

      setUser(user);

      // Allow any logged in user to access dashboard
      console.log('User logged in:', user.email);

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
      // Import admin client to bypass RLS when not authenticated
      const { supabaseAdmin } = await import('@/integrations/supabase/admin-client');
      const { data, error } = await supabaseAdmin
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
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex w-full">
        <AppSidebar 
          viewMode={viewMode} 
          onViewModeChange={(mode) => setViewMode(mode as 'memberships' | 'orders' | 'profiles' | 'products' | 'partners' | 'pricing' | 'partner-pricing' | 'discounts')} 
        />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="sticky top-0 z-40 border-b border-border/50 bg-card/95 backdrop-blur-sm">
            <div className="flex items-center gap-4 p-6 mt-16 pt-8">
              <SidebarTrigger className="shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Beheer lidmaatschappen, bestellingen en bedrijfsprofielen
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to="/">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Home
                    </Button>
                  </Link>
                  <Button onClick={exportToCsv} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={testEmail} 
                    disabled={testingEmail}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Mail className="w-4 h-4" />
                    {testingEmail ? "Verzenden..." : "Test Email"}
                  </Button>
                  <Button 
                    onClick={createTestOrder} 
                    disabled={creatingTestOrder}
                    className="flex items-center gap-2"
                    variant="secondary"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {creatingTestOrder ? "Aanmaken..." : "Test Bestelling"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 mt-6">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'memberships' | 'orders' | 'profiles' | 'products' | 'partners' | 'pricing' | 'partner-pricing' | 'discounts')}>
              <TabsContent value="memberships" className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-200/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Totaal Lidmaatschappen
                      </CardTitle>
                      <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{memberships.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {memberships.filter(m => m.payment_status === 'paid').length} betaald
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-200/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Nieuwe Deze Maand
                      </CardTitle>
                      <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {memberships.filter(m => {
                          const created = new Date(m.created_at);
                          const now = new Date();
                          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                        }).length}
                      </div>
                      <p className="text-xs text-muted-foreground">dit kalenderjaar</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-200/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Openstaand
                      </CardTitle>
                      <CreditCard className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {memberships.filter(m => m.payment_status === 'pending').length}
                      </div>
                      <p className="text-xs text-muted-foreground">nog te betalen</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-200/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Geannuleerd
                      </CardTitle>
                      <CreditCard className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {memberships.filter(m => m.payment_status === 'cancelled').length}
                      </div>
                      <p className="text-xs text-muted-foreground">niet voltooid</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-200/30">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Totaal Bestellingen
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">{orders.length}</div>
                        <p className="text-xs text-muted-foreground">
                          {orders.filter(o => o.payment_status === 'paid').length} betaald
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-200/30">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Omzet
                        </CardTitle>
                        <Euro className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          €{(orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total, 0) / 100).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">betaalde bestellingen</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-200/30">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Openstaand
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {orders.filter(o => o.payment_status === 'pending').length}
                        </div>
                        <p className="text-xs text-muted-foreground">nog te betalen</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-200/30">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Gemiddelde Bestelling
                        </CardTitle>
                        <Package className="h-4 w-4 text-purple-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          €{orders.length > 0 ? (orders.reduce((sum, o) => sum + o.total, 0) / orders.length / 100).toFixed(2) : '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">per bestelling</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Orders Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Bestellingen
                      </CardTitle>
                      <CardDescription>Beheer alle webshop bestellingen</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Klant</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Totaal</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Datum</TableHead>
                              <TableHead className="text-right">Acties</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                  {order.customer_first_name} {order.customer_last_name}
                                </TableCell>
                                <TableCell>{order.customer_email || order.email}</TableCell>
                                <TableCell>
                                  {Array.isArray(order.items) ? order.items.length : 'N/A'} items
                                </TableCell>
                                <TableCell>€{(order.total / 100).toFixed(2)}</TableCell>
                                <TableCell>
                                  <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                                    {order.payment_status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center gap-2 justify-end">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => editOrder(order)}
                                      title="Bewerk bestelling"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => printOrderDetails(order)}
                                      title="Print bestelling"
                                    >
                                      <Printer className="w-4 h-4" />
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
                </div>
              </TabsContent>

              <TabsContent value="profiles">
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-200/30">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Totaal Bedrijven
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">{profiles.length}</div>
                        <p className="text-xs text-muted-foreground">
                          {profiles.filter(p => p.is_featured).length} uitgelicht
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-200/30">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Met Website
                        </CardTitle>
                        <Globe className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {profiles.filter(p => p.website).length}
                        </div>
                        <p className="text-xs text-muted-foreground">actieve links</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-200/30">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Met Logo
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-purple-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {profiles.filter(p => p.logo_url).length}
                        </div>
                        <p className="text-xs text-muted-foreground">visuele identiteit</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-200/30">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Contactinfo
                        </CardTitle>
                        <Mail className="h-4 w-4 text-orange-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {profiles.filter(p => p.contact_email || p.contact_phone).length}
                        </div>
                        <p className="text-xs text-muted-foreground">bereikbaar</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Company Profiles Table */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Bedrijfsprofielen
                          </CardTitle>
                          <CardDescription>Beheer alle bedrijfsprofielen in de partnersgalerij</CardDescription>
                        </div>
                        <Button 
                          onClick={() => {
                            setEditingProfile(null);
                            setShowProfileForm(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Nieuw Profiel
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Bedrijf</TableHead>
                              <TableHead>Industrie</TableHead>
                              <TableHead>Website</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Volgorde</TableHead>
                              <TableHead className="text-right">Acties</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {profiles.map((profile) => (
                              <TableRow key={profile.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {profile.logo_url && (
                                      <img 
                                        src={profile.logo_url} 
                                        alt={profile.name}
                                        className="w-8 h-8 rounded object-cover"
                                      />
                                    )}
                                    {profile.name}
                                  </div>
                                </TableCell>
                                <TableCell>{profile.industry || 'Niet gespecificeerd'}</TableCell>
                                <TableCell>
                                  {profile.website ? (
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {profile.website.replace('https://', '').replace('http://', '')}
                                    </a>
                                  ) : (
                                    'Geen website'
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {profile.contact_email && (
                                      <div className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {profile.contact_email}
                                      </div>
                                    )}
                                    {profile.contact_phone && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {profile.contact_phone}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={profile.is_featured ? 'default' : 'secondary'}>
                                    {profile.is_featured ? 'Uitgelicht' : 'Normaal'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{profile.display_order}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center gap-2 justify-end">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        setEditingProfile(profile);
                                        setShowProfileForm(true);
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDeleteProfile(profile.id)}
                                      className="text-destructive hover:text-destructive"
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
                </div>
              </TabsContent>

              <TabsContent value="products">
                <div className="space-y-6">
                  <ProductManagement 
                    products={products}
                    onProductsChange={fetchProducts}
                  />
                </div>
              </TabsContent>

              <TabsContent value="partners">
                <div className="space-y-6">
                  <PartnerAccountManagement />
                </div>
              </TabsContent>

              <TabsContent value="pricing">
                <div className="space-y-6">
                  <MembershipPricingManager />
                </div>
              </TabsContent>

              <TabsContent value="partner-pricing">
                <div className="space-y-6">
                  <PartnerPricingManager />
                </div>
              </TabsContent>

              <TabsContent value="discounts">
                <div className="space-y-6">
                  <DiscountCodeManager />
                </div>
              </TabsContent>

              <TabsContent value="qrcode">
                <div className="space-y-6">
                  <QRCodeGenerator />
                  <QRCodeManager />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Company Profile Form Dialog */}
      <CompanyProfileForm
        open={showProfileForm}
        onOpenChange={setShowProfileForm}
        onSuccess={() => {
          fetchProfiles();
          setShowProfileForm(false);
          setEditingProfile(null);
        }}
        editingProfile={editingProfile}
        isPartnerDashboard={false}
      />

      {/* Order Edit Dialog */}
      <Dialog open={isEditingOrder} onOpenChange={setIsEditingOrder}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bestelling Bewerken</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Voornaam</label>
                  <Input
                    value={editingOrder.customer_first_name || ''}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      customer_first_name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Achternaam</label>
                  <Input
                    value={editingOrder.customer_last_name || ''}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      customer_last_name: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={editingOrder.customer_email || ''}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      customer_email: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefoon</label>
                  <Input
                    value={editingOrder.customer_phone || ''}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      customer_phone: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Adresgegevens</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Straatnaam</label>
                    <Input
                      value={editingOrder.address_street || ''}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        address_street: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Huisnummer</label>
                    <Input
                      value={editingOrder.address_house_number || ''}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        address_house_number: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Postcode</label>
                    <Input
                      value={editingOrder.address_postcode || ''}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        address_postcode: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Plaats</label>
                    <Input
                      value={editingOrder.address_city || ''}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        address_city: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Land</label>
                  <Input
                    value={editingOrder.address_country || ''}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      address_country: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Bestelling Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Payment Status</label>
                    <Select
                      value={editingOrder.payment_status}
                      onValueChange={(value) => setEditingOrder({
                        ...editingOrder,
                        payment_status: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Totaal (in centen)</label>
                    <Input
                      type="number"
                      value={editingOrder.total}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        total: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingOrder(false);
                    setEditingOrder(null);
                  }}
                >
                  Annuleren
                </Button>
                <Button onClick={updateOrder}>
                  Opslaan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Dashboard;