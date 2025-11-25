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
import { validateDiscountCode, calculateDiscount, formatDiscountDisplay } from "@/lib/discountUtils";
import type { DiscountValidationResult } from "@/lib/discountUtils";
import { usePartnerPricingTiers } from "@/hooks/usePartnerPricingTiers";

const formSchema = z.object({
  firstName: z.string().min(2, "Voornaam moet minimaal 2 karakters bevatten"),
  lastName: z.string().min(2, "Achternaam moet minimaal 2 karakters bevatten"),
  email: z.string().email("Voer een geldig e-mailadres in"),
  phone: z.string().min(10, "Voer een geldig telefoonnummer in"),
  companyName: z.string().min(2, "Bedrijfsnaam is verplicht"),
  website: z.string().url("Voer een geldige URL in").optional().or(z.literal("")),
  industry: z.string({
    required_error: "Selecteer een branche",
  }),
  companySize: z.string({
    required_error: "Selecteer bedrijfsgrootte",
  }),
  description: z.string().optional(),
  discountCode: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Je moet akkoord gaan met de algemene voorwaarden",
  }),
});

interface PartnerSignupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PartnerSignupForm = ({ open, onOpenChange }: PartnerSignupFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountValidationResult | null>(null);
  const { toast } = useToast();
  const { pricingTiers, loading: pricingLoading } = usePartnerPricingTiers();
  
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
      discountCode: "",
      acceptTerms: false,
    }
  });

  // Pricing logic based on company size using dynamic pricing from database
  const getAmountFromSize = (size: string) => {
    if (!pricingTiers?.length) {
      // Fallback prices if no pricing data available
      switch(size) {
        case '1-10 medewerkers': return 50000; // €500
        case '11-30 medewerkers': return 75000; // €750
        case '31-50 medewerkers': return 125000; // €1250
        case '50+ medewerkers': return 0; // Offerte
        default: return 50000;
      }
    }
    
    const priceOption = pricingTiers.find(p => p.employee_range === size);
    return priceOption ? (priceOption.is_quote ? 0 : priceOption.price_cents) : 50000;
  };

  const getPriceDisplay = (size: string) => {
    if (!pricingTiers?.length) {
      // Fallback prices if no pricing data available
      switch(size) {
        case '1-10 medewerkers': return '€500';
        case '11-30 medewerkers': return '€750';
        case '31-50 medewerkers': return '€1250';
        case '50+ medewerkers': return 'Offerte op maat';
        default: return '€500';
      }
    }
    
    const priceOption = pricingTiers.find(p => p.employee_range === size);
    return priceOption ? priceOption.price_display : '€500';
  };

  const selectedSize = form.watch('companySize');
  const currentPrice = getPriceDisplay(selectedSize);
  
  // Calculate price with (optionele) korting
  const baseAmount = getAmountFromSize(selectedSize);
  const discountAmount = appliedDiscount?.valid && appliedDiscount.discount 
    ? calculateDiscount(appliedDiscount.discount, baseAmount)
    : 0;
  const finalAmount = baseAmount - discountAmount;
  const hasDiscount = discountAmount > 0;
  
  const finalPrice =
    baseAmount === 0
      ? 'Offerte op maat'
      : hasDiscount
        ? `€${(finalAmount / 100).toFixed(2)}`
        : currentPrice;

  const checkDiscountCode = async () => {
    const discountCode = form.getValues('discountCode');
    if (!discountCode?.trim()) {
      setAppliedDiscount(null);
      return;
    }

    setIsCheckingDiscount(true);
    try {
      console.log('Checking discount code:', discountCode, 'for amount:', baseAmount);
      const result = await validateDiscountCode(discountCode, 'partners', baseAmount);
      console.log('Discount validation result:', result);
      setAppliedDiscount(result);
      
      if (result.valid) {
        toast({
          title: "Kortingscode toegepast!",
          description: `${formatDiscountDisplay(result.discount!)} korting toegepast.`,
        });
      } else {
        toast({
          title: "Ongeldige kortingscode",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking discount code:', error);
      toast({
        title: "Fout",
        description: "Kon kortingscode niet controleren",
        variant: "destructive"
      });
    } finally {
      setIsCheckingDiscount(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const amount = finalAmount;
      
      // Handle "50+ medewerkers" (offerte) case
      if (values.companySize === '50+ medewerkers') {
        toast({
          title: "Offerte aanvragen",
          description: "Voor grote bedrijven maken we graag een persoonlijke offerte. We nemen binnen 24 uur contact met je op.",
        });
        onOpenChange(false);
        return;
      }

      // Handle free partnership (100% discount)
      if (finalAmount === 0) {
        console.log('Free partnership detected, creating directly without payment');
        
        // Create partner membership directly without Mollie payment
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
            amount: 0,
            discountCode: appliedDiscount?.valid ? values.discountCode : undefined,
            discountAmount: discountAmount,
            skipPayment: true // Special flag for free partnerships
          }
        });

        if (error || data?.error) {
          const msg = (data?.error as string) || (error?.message as string) || 'Onbekende fout';
          console.error('Free partner creation error:', msg);
          toast({
            title: "Fout bij aanmelding",
            description: msg,
            variant: "destructive"
          });
          return;
        }

        // Send confirmation email for free partnership
        try {
          await supabase.functions.invoke('send-partner-confirmation', {
            body: {
              email: values.email,
              firstName: values.firstName,
              lastName: values.lastName,
              companyName: values.companyName,
              membershipType: values.companySize,
              amount: 0,
              discountCode: values.discountCode,
              discountAmount: discountAmount
            }
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't block the flow if email fails
        }

        // Redirect to success page
        window.location.href = '/partnership-success';
        return;
      }

      console.log('Sending to edge function:', {
        amount: amount,
        discountCode: appliedDiscount?.valid ? values.discountCode : undefined,
        discountAmount: discountAmount,
        baseAmount: baseAmount,
        finalAmount: finalAmount
      });

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
          amount: finalAmount, // Use final amount after discount
          originalAmount: amount, // Keep original for metadata
          discountCode: appliedDiscount?.valid ? values.discountCode : undefined,
          discountAmount: discountAmount
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
                      <SelectContent className="bg-background border-border z-50">
                        {pricingLoading ? (
                          <SelectItem value="loading" disabled>Prijzen laden...</SelectItem>
                        ) : pricingTiers?.length > 0 ? (
                          pricingTiers
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((option) => (
                              <SelectItem key={option.id} value={option.employee_range}>
                                {option.employee_range} - {option.price_display}
                              </SelectItem>
                            ))
                        ) : (
                          // Fallback options if no pricing data available
                          <>
                            <SelectItem value="1-10 medewerkers">1-10 medewerkers - €500/jaar</SelectItem>
                            <SelectItem value="11-30 medewerkers">11-30 medewerkers - €750/jaar</SelectItem>
                            <SelectItem value="31-50 medewerkers">31-50 medewerkers - €1250/jaar</SelectItem>
                            <SelectItem value="50+ medewerkers">50+ medewerkers - Offerte</SelectItem>
                          </>
                        )}
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
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Kortingscode */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Kortingscode (optioneel)</h3>
              <FormField
                control={form.control}
                name="discountCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kortingscode</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Voer je kortingscode in" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Clear applied discount when code changes
                          if (appliedDiscount) {
                            setAppliedDiscount(null);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('discountCode')?.trim() && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={checkDiscountCode}
                  disabled={isCheckingDiscount}
                >
                  {isCheckingDiscount ? "Controleren..." : "Controleer kortingscode"}
                </Button>
              )}
            </div>

            {/* Prijsoverzicht */}
            {selectedSize && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Prijsoverzicht</h4>
                <div className="flex items-center justify-between">
                  <span>Bedrijfsgrootte: {selectedSize}</span>
                  <span className="font-medium">{currentPrice}</span>
                </div>
                {appliedDiscount?.valid && appliedDiscount.discount && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Korting: {formatDiscountDisplay(appliedDiscount.discount)}</span>
                    <span>-€{(discountAmount / 100).toFixed(2)}</span>
                  </div>
                )}
                {baseAmount > 0 && (
                  <div className="flex items-center justify-between font-bold text-lg border-t pt-2">
                    <span>Totaal:</span>
                    <span>{finalPrice}</span>
                  </div>
                )}
                {baseAmount === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Voor grote bedrijven maken we een persoonlijke offerte.
                  </p>
                )}
              </div>
            )}

            {/* Algemene voorwaarden */}
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Ik ga akkoord met de{" "}
                      <a
                        href="/algemene-voorwaarden"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:no-underline"
                      >
                        algemene voorwaarden
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Verwerken..."
              ) : baseAmount === 0 ? (
                "Offerte aanvragen"
              ) : (
                `Doorgaan naar betaling - ${finalPrice}`
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerSignupForm;