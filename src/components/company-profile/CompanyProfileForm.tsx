import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import type { CompanyProfile, CompanyProfileFormData } from "@/types/companyProfile";

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

interface CompanyProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  profile?: CompanyProfile | null;
  partnerMembershipId?: string | null;
  isPartnerDashboard?: boolean;
}

const CompanyProfileForm = ({
  open,
  onOpenChange,
  onSuccess,
  profile = null,
  partnerMembershipId = null,
  isPartnerDashboard = false,
}: CompanyProfileFormProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(profile?.logo_url || null);
  const [uploading, setUploading] = useState(false);
  
  const { createProfile, updateProfile, uploadLogo } = useCompanyProfile();

  const form = useForm<CompanyProfileFormData>({
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

  // Reset form when profile changes or dialog opens
  useEffect(() => {
    if (open) {
      const formValues = {
        name: profile?.name || "",
        description: profile?.description || "",
        website: profile?.website || "",
        industry: profile?.industry || "",
        contact_email: profile?.contact_email || "",
        contact_phone: profile?.contact_phone || "",
        is_featured: profile?.is_featured || false,
        display_order: profile?.display_order || 0,
      };
      form.reset(formValues);
      setLogoUrl(profile?.logo_url || null);
    }
  }, [open, profile, form]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const newLogoUrl = await uploadLogo(file);
      setLogoUrl(newLogoUrl);
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoUrl(null);
  };

  const onSubmit = async (data: CompanyProfileFormData) => {
    try {
      if (profile) {
        // Update existing profile
        await updateProfile({
          id: profile.id,
          ...data,
          logo_url: logoUrl,
        });
      } else {
        // Create new profile
        await createProfile({
          ...data,
          logo_url: logoUrl,
          partner_membership_id: partnerMembershipId,
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {profile ? "Bedrijfsprofiel Bewerken" : "Bedrijfsprofiel Aanmaken"}
          </DialogTitle>
          <DialogDescription>
            {profile 
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
                    disabled={uploading || form.formState.isSubmitting}
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
                disabled={form.formState.isSubmitting || uploading}
              >
                Annuleren
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || uploading}
              >
                {form.formState.isSubmitting ? "Bezig..." : profile ? "Bijwerken" : "Aanmaken"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyProfileForm;