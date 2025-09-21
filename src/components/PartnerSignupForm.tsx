import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  firstName: z.string().min(2, "Voornaam moet minimaal 2 karakters bevatten"),
  lastName: z.string().min(2, "Achternaam moet minimaal 2 karakters bevatten"),
  email: z.string().email("Voer een geldig e-mailadres in"),
  phone: z.string().min(10, "Voer een geldig telefoonnummer in"),
  companyName: z.string().min(2, "Bedrijfsnaam is verplicht"),
  website: z.string().url("Voer een geldige URL in").optional().or(z.literal("")),
  industry: z.string({
    required_error: "Selecteer een branche"
  }),
  companySize: z.string({
    required_error: "Selecteer bedrijfsgrootte"
  }),
  description: z.string().optional(),
});

interface PartnerSignupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PartnerSignupForm = ({ open, onOpenChange }: PartnerSignupFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      website: "",
      industry: "",
      companySize: "",
      description: "",
    }
  });

  // Pricing logic based on company size
  const getAmountFromSize = (size: string) => {
    switch(size) {
      case 'zzp': return 25000; // €250
      case 'klein': return 45000; // €450
      case 'middelgroot': return 75000; // €750
      case 'groot': return 0; // Offerte
      default: return 25000;
    }
  };

  const getPriceDisplay = (size: string) => {
    switch(size) {
      case 'zzp': return '€250';
      case 'klein': return '€450';
      case 'middelgroot': return '€750';
      case 'groot': return 'Offerte op maat';
      default: return '€250';
    }
  };

  const selectedSize = form.watch('companySize');
  const currentPrice = getPriceDisplay(selectedSize);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const amount = getAmountFromSize(values.companySize);
      
      // Handle "groot" (offerte) case
      if (values.companySize === 'groot') {
        toast({
          title: "Offerte aanvragen",
          description: "Voor grote bedrijven maken we graag een persoonlijke offerte. We nemen binnen 24 uur contact met je op.",
        });
        onOpenChange(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-partner-payment', {
        body: { 
          partnerData: {
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            phone: values.phone,
            company_name: values.companyName,
            website: values.website || null,
            industry: values.industry,
            company_size: values.companySize,
            description: values.description
          },
          amount: amount
        }
      });

      if (error || data?.error) {
        const msg = (data?.error as string) || (error?.message as string) || 'Onbekende fout';
        console.error('Partner payment creation error:', msg);
        toast({
          title: "Fout bij betaling",
          description: msg,
          variant: "destructive"
        });
        return;
      }

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Geen betaallink ontvangen');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Word Partner van Bouw met Respect</DialogTitle>
          <DialogDescription>
            Sluit je aan bij onze community van partners. De prijs hangt af van je bedrijfsgrootte.
            Na betaling kun je je bedrijfsprofiel beheren via je persoonlijke dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Persoonlijke gegevens */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Persoonlijke gegevens</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voornaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Voornaam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achternaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Achternaam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mailadres</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="naam@bedrijf.nl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefoonnummer</FormLabel>
                    <FormControl>
                      <Input placeholder="06 12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bedrijfsgegevens */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bedrijfsgegevens</h3>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrijfsnaam</FormLabel>
                    <FormControl>
                      <Input placeholder="Bedrijfsnaam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (optioneel)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.bedrijf.nl" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer branche" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="aannemer">Aannemer</SelectItem>
                          <SelectItem value="architect">Architect</SelectItem>
                          <SelectItem value="installateur">Installateur</SelectItem>
                          <SelectItem value="projectontwikkelaar">Projectontwikkelaar</SelectItem>
                          <SelectItem value="woningcorporatie">Woningcorporatie</SelectItem>
                          <SelectItem value="adviseur">Adviseur</SelectItem>
                          <SelectItem value="leverancier">Leverancier</SelectItem>
                          <SelectItem value="overheid">Overheid</SelectItem>
                          <SelectItem value="anders">Anders</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Bedrijfsgrootte */}
              <FormField
                control={form.control}
                name="companySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrijfsgrootte</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer bedrijfsgrootte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="zzp">ZZP - €250/jaar</SelectItem>
                        <SelectItem value="klein">2-10 medewerkers - €450/jaar</SelectItem>
                        <SelectItem value="middelgroot">11-20 medewerkers - €750/jaar</SelectItem>
                        <SelectItem value="groot">Meer dan 20 medewerkers - Offerte</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrijfsbeschrijving</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Vertel over je bedrijf, specialisaties en hoe jullie bijdragen aan respectvolle en duurzame bouwpraktijken..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="sm:flex-1"
              >
                Annuleren
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedSize}
                className="sm:flex-1"
              >
                {isSubmitting 
                  ? "Bezig met verwerken..." 
                  : selectedSize 
                    ? `Partner worden voor ${currentPrice}/jaar`
                    : "Selecteer eerst bedrijfsgrootte"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerSignupForm;