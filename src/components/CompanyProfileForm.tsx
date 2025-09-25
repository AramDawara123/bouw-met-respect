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
    industry: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    is_featured: boolean;
    display_order: number;
    logo_url: string | null;
    partner_membership_id: string | null;
  } | null;
  isPartnerDashboard?: boolean;
  partnerMembershipId?: string | null;
}

const CompanyProfileForm = ({
  open,
  onOpenChange,
  onSuccess,
  editingProfile = null,
  isPartnerDashboard = false,
  partnerMembershipId = null
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

  console.log('🚪 Dialog opened - open:', open);
  
  // Debug partner membership ID
  useEffect(() => {
    console.log('🆔 Partner membership ID:', {
      _type: typeof partnerMembershipId,
      value: partnerMembershipId || 'undefined'
    });
  }, [partnerMembershipId]);

  useEffect(() => {
    console.log('🔄 Form effect triggered - editingProfile:', editingProfile ? 'exists' : 'null');
    if (open) {
      if (editingProfile) {
        form.reset({
          name: editingProfile.name || "",
          description: editingProfile.description || "",
          website: editingProfile.website || "",
          industry: editingProfile.industry || "",
          contact_email: editingProfile.contact_email || "",
          contact_phone: editingProfile.contact_phone || "",
          is_featured: editingProfile.is_featured || false,
          display_order: editingProfile.display_order || 0,
        });
        setLogoUrl(editingProfile.logo_url);
      } else {
        form.reset({
          name: "",
          description: "",
          website: "",
          industry: "",
          contact_email: "",
          contact_phone: "",
          is_featured: false,
          display_order: 0,
        });
        setLogoUrl(null);
      }
    }
  }, [editingProfile, open]);

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
    console.log('🚀 Form submission started with data:', data);
    console.log('🏢 Is partner dashboard:', isPartnerDashboard);
    console.log('✏️ Editing profile:', editingProfile ? 'YES - ID: ' + editingProfile.id : 'NO - Creating new');
    setLoading(true);
    try {
      // Check authentication and user details first
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

      // For partner dashboard, get the current partner membership ID from the editing profile
      let finalPartnerMembershipId = partnerMembershipId;
      if (isPartnerDashboard && editingProfile?.partner_membership_id) {
        // For existing profiles, keep the same partner_membership_id
        finalPartnerMembershipId = editingProfile.partner_membership_id;
        console.log('✅ Using existing partner membership ID for edit:', finalPartnerMembershipId);
      } else if (isPartnerDashboard && user?.id && !editingProfile) {
        // Only verify for new profiles
        const { data: partnerCheck, error: partnerError } = await supabase
          .from('partner_memberships')
          .select('id, payment_status')
          .eq('user_id', user.id)
          .eq('payment_status', 'paid')
          .single();
        
        console.log('🎫 Partner membership check for new profile:', partnerCheck);
        if (partnerError || !partnerCheck) {
          throw new Error('Geen actieve partner membership gevonden');
        }
        
        finalPartnerMembershipId = partnerCheck.id;
        console.log('✅ Using verified partner membership ID for new profile:', finalPartnerMembershipId);
      }

      const profileData = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        website: data.website?.trim() || null,
        industry: data.industry?.trim() || null,
        contact_email: data.contact_email?.trim() || null,
        contact_phone: data.contact_phone?.trim() || null,
        is_featured: isPartnerDashboard ? false : data.is_featured,
        display_order: data.display_order || 0,
        logo_url: logoUrl,
        ...(isPartnerDashboard && finalPartnerMembershipId && { partner_membership_id: finalPartnerMembershipId })
      };

      console.log('💾 Saving profile data:', profileData);
      console.log('📝 Editing profile ID:', editingProfile?.id);
      console.log('🆔 Final partner membership ID:', finalPartnerMembershipId);

      let updateResult;
      if (editingProfile) {
        console.log('📝 Starting UPDATE operation...');
        
        updateResult = await supabase
          .from('company_profiles')
          .update(profileData)
          .eq('id', editingProfile.id)
          .select();

        console.log('📝 Update result:', updateResult);

        if (updateResult.error) {
          console.error('❌ Update error:', updateResult.error);
          throw new Error(`Update failed: ${updateResult.error.message}`);
        }
      } else {
        console.log('➕ Starting INSERT operation...');
        updateResult = await supabase
          .from('company_profiles')
          .insert([profileData])
          .select();

        console.log('➕ Insert result:', updateResult);

        if (updateResult.error) {
          console.error('❌ Insert error:', updateResult.error);
          throw new Error(`Insert failed: ${updateResult.error.message}`);
        }
      }

      console.log('✅ Database operation successful');

      // Dispatch custom event for any listening components
      window.dispatchEvent(new CustomEvent('company-profile-updated'));
      console.log('📡 Dispatched company-profile-updated event');

      toast({
        title: "Succes!",
        description: editingProfile 
          ? "Bedrijfsprofiel succesvol bijgewerkt" 
          : "Bedrijfsprofiel succesvol aangemaakt",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Form submission error:', error);
      toast({
        title: "Fout",
        description: error.message || "Er ging iets mis bij het opslaan van het profiel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProfile ? "Bedrijfsprofiel Bewerken" : "Bedrijfsprofiel Aanmaken"}
          </DialogTitle>
          <DialogDescription>
            {editingProfile 
              ? "Pas de gegevens van je bedrijfsprofiel aan." 
              : "Maak een nieuw bedrijfsprofiel aan dat zichtbaar wordt voor bezoekers."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Upload Section */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Bedrijfslogo</label>
                <div className="mt-2">
                  {logoUrl ? (
                    <div className="relative inline-block">
                      <img 
                        src={logoUrl} 
                        alt="Company logo" 
                        className="w-24 h-24 object-cover rounded-lg border-2 border-border"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="mt-2 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  {uploading && <p className="text-sm text-muted-foreground mt-1">Uploaden...</p>}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Bedrijfsnaam *</FormLabel>
                    <FormControl>
                      <Input placeholder="Bedrijfsnaam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
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
                      <Input placeholder="bijv. Bouw, IT, Consultancy" {...field} />
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

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Telefoon</FormLabel>
                    <FormControl>
                      <Input placeholder="+31 20 1234567" {...field} />
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
                      placeholder="Vertel over je bedrijf, wat jullie doen, en hoe jullie bijdragen aan een respectvolle bouwsector..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isPartnerDashboard && (
              <>
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Uitgelicht</FormLabel>
                        <FormDescription>
                          Uitgelichte profielen worden prominenter getoond
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

                <FormField
                  control={form.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volgorde</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Bepaalt de volgorde waarin profielen worden getoond (lagere nummers eerst)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuleren
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {loading ? "Bezig..." : editingProfile ? "Bijwerken" : "Aanmaken"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyProfileForm;
