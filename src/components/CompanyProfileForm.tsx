import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Upload, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Bedrijfsnaam is verplicht"),
  description: z.string().optional(),
  website: z.string().url("Ongeldige URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  contact_email: z.string().email("Ongeldig e-mailadres").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  is_featured: z.boolean().default(false),
  display_order: z.number().min(0).default(0),
});

type FormData = z.infer<typeof formSchema>;

interface CompanyProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingProfile?: {
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
    partner_membership_id?: string | null;
  } | null;
  isPartnerDashboard?: boolean;
  partnerMembershipId?: string;
}

const CompanyProfileForm = ({ 
  open, 
  onOpenChange, 
  onSuccess, 
  editingProfile, 
  isPartnerDashboard = false, 
  partnerMembershipId 
}: CompanyProfileFormProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      industry: "",
      contact_email: "",
      contact_phone: "",
      is_featured: false,
      display_order: 0,
    },
  });

  useEffect(() => {
    console.log('🔄 Form effect triggered - editingProfile:', editingProfile);
    console.log('🆔 Partner membership ID:', partnerMembershipId);
    if (editingProfile) {
      console.log('📝 Setting form values for editing:', {
        name: editingProfile.name,
        description: editingProfile.description || "",
        website: editingProfile.website || "",
        industry: editingProfile.industry || "",
        contact_email: editingProfile.contact_email || "",
        contact_phone: editingProfile.contact_phone || "",
        is_featured: editingProfile.is_featured,
        display_order: editingProfile.display_order,
      });
      form.reset({
        name: editingProfile.name,
        description: editingProfile.description || "",
        website: editingProfile.website || "",
        industry: editingProfile.industry || "",
        contact_email: editingProfile.contact_email || "",
        contact_phone: editingProfile.contact_phone || "",
        is_featured: editingProfile.is_featured,
        display_order: editingProfile.display_order,
      });
      setLogoUrl(editingProfile.logo_url);
    } else {
      console.log('➕ Resetting form for new profile');
      form.reset();
      setLogoUrl(null);
    }
  }, [editingProfile, form]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Fout",
        description: "Logo moet kleiner zijn dan 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('smb')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('smb')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      toast({
        title: "Succes",
        description: "Logo succesvol geüpload",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Fout",
        description: "Kon logo niet uploaden",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoUrl(null);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const profileData = {
        name: data.name,
        description: data.description || null,
        website: data.website || null,
        industry: data.industry || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        is_featured: isPartnerDashboard ? false : data.is_featured,
        display_order: data.display_order,
        logo_url: logoUrl,
        ...(isPartnerDashboard && partnerMembershipId && { partner_membership_id: partnerMembershipId })
      };

      console.log('💾 Saving profile data:', profileData);
      console.log('📝 Editing profile ID:', editingProfile?.id);
      console.log('🆔 Partner membership ID:', partnerMembershipId);

      // Check authentication and user details once for both update and create
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('🚨 Auth error:', authError);
        throw new Error('Authentication failed: ' + authError.message);
      }
      
      console.log('👤 User ID:', user?.id || 'Not authenticated');
      console.log('📧 User email:', user?.email || 'No email');
      
      const isAdmin = user?.email === 'info@bouwmetrespect.nl';
      console.log('🔑 Is admin:', isAdmin);
      console.log('🏢 Is partner dashboard:', isPartnerDashboard);

      // Check if user has a paid partner membership
      if (isPartnerDashboard && user?.id) {
        const { data: partnerCheck, error: partnerError } = await supabase
          .from('partner_memberships')
          .select('id, payment_status')
          .eq('user_id', user.id)
          .eq('payment_status', 'paid')
          .single();
        
        console.log('🎫 Partner membership check:', partnerCheck);
        if (partnerError) console.log('🚨 Partner check error:', partnerError);
      }

      let updateResult;
      if (editingProfile) {
        // Always use admin client for dashboard updates if user claims admin email
        if (isAdmin && !isPartnerDashboard) {
          console.log('🔧 Using admin client for update (bypassing RLS)');
          const { supabaseAdmin } = await import('@/integrations/supabase/admin-client');
          updateResult = await supabaseAdmin
            .from('company_profiles')
            .update(profileData)
            .eq('id', editingProfile.id)
            .select();
        } else {
          console.log('👥 Using regular client for update');
          updateResult = await supabase
            .from('company_profiles')
            .update(profileData)
            .eq('id', editingProfile.id)
            .select();
        }

        console.log('📝 Update result:', updateResult);

        if (updateResult.error) {
          console.error('❌ Update error:', updateResult.error);
          console.error('❌ Error details:', JSON.stringify(updateResult.error, null, 2));
          
          // Provide more specific error messages
          if (updateResult.error.message?.includes('row-level security')) {
            throw new Error('Not authorized to edit this company profile. Please ensure you are logged in as an admin.');
          } else if (updateResult.error.message?.includes('JWT')) {
            throw new Error('Authentication session expired. Please log in again.');
          }
          
          throw updateResult.error;
        }

        console.log('✅ Profile updated successfully:', updateResult.data);
        
        toast({
          title: "Succes",
          description: "Bedrijfsprofiel succesvol bijgewerkt",
        });
        
        // Dispatch event to refresh other pages
        console.log('📡 Dispatching company-profile-updated event');
        window.dispatchEvent(new CustomEvent('company-profile-updated'));
      } else {
        console.log('➕ Creating new profile');
        
        // Use admin client if user claims admin email
        if (isAdmin && !isPartnerDashboard) {
          console.log('🔧 Using admin client for insert (bypassing RLS)');
          const { supabaseAdmin } = await import('@/integrations/supabase/admin-client');
          const { error } = await supabaseAdmin
            .from('company_profiles')
            .insert(profileData);
          
          if (error) throw error;
        } else {
          console.log('👥 Using regular client for insert');
          const { error } = await supabase
            .from('company_profiles')
            .insert(profileData);

          if (error) throw error;
        }

        console.log('✅ Profile created successfully');
        
        toast({
          title: "Succes",
          description: "Bedrijfsprofiel succesvol aangemaakt",
        });
        
        // Dispatch event to refresh other pages
        console.log('📡 Dispatching company-profile-updated event');
        window.dispatchEvent(new CustomEvent('company-profile-updated'));
      }

      onSuccess();
    } catch (error) {
      console.error('💥 Error saving profile:', error);
      toast({
        title: "Fout",
        description: `Kon bedrijfsprofiel niet ${editingProfile ? 'bijwerken' : 'aanmaken'}: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('🚪 Dialog opened - open:', open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProfile ? "Bedrijfsprofiel Bewerken" : "Nieuw Bedrijfsprofiel"}
          </DialogTitle>
          <DialogDescription>
            {editingProfile
              ? "Wijzig de gegevens van het bedrijfsprofiel"
              : "Voeg een nieuw bedrijfsprofiel toe aan de directory"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrijfsnaam *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Bedrijfsnaam" 
                        disabled={loading || uploading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branche</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Bijv. Bouw, Architectuur, etc." 
                        disabled={loading || uploading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschrijving</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Korte beschrijving van het bedrijf..."
                      className="min-h-[100px]"
                      disabled={loading || uploading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Een korte beschrijving van wat het bedrijf doet en waarom ze respectvol bouwen
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Logo</FormLabel>
              {logoUrl ? (
                <div className="flex items-center gap-4">
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="w-16 h-16 object-contain border rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeLogo}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Verwijderen
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground mb-2">
                      Sleep een logo hierheen of klik om te uploaden
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">
                      PNG, JPG tot 2MB
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Bestand Selecteren"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.bedrijf.nl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@bedrijf.nl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefoon</FormLabel>
                    <FormControl>
                      <Input placeholder="+31 6 12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volgorde</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Lagere nummers verschijnen eerst
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

{!isPartnerDashboard && (
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured</FormLabel>
                    <FormDescription>
                      Uitgelichte bedrijven worden prominenter weergegeven
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuleren
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Opslaan..."
                  : editingProfile
                  ? "Bijwerken"
                  : "Aanmaken"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyProfileForm;