import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tag, Check } from "lucide-react";
import { validateDiscountCode, calculateDiscount, formatDiscountDisplay } from "@/lib/discountUtils";
import { useMembershipPricing } from "@/hooks/useMembershipPricing";
const formSchema = z.object({
  firstName: z.string().min(2, "Voornaam moet minimaal 2 karakters bevatten"),
  lastName: z.string().min(2, "Achternaam moet minimaal 2 karakters bevatten"),
  email: z.string().email("Voer een geldig e-mailadres in"),
  phone: z.string().min(10, "Voer een geldig telefoonnummer in"),
  company: z.string().optional(),
  jobTitle: z.string().min(2, "Functietitel is verplicht"),
  industryRole: z.string({
    required_error: "Selecteer je rol in de bouwsector"
  }),
  experienceYears: z.string({
    required_error: "Selecteer je ervaring"
  }),
  specializations: z.array(z.string()).min(1, "Selecteer minimaal één specialisatie"),
  motivation: z.string().min(10, "Motivatie is verplicht (minimaal 10 karakters)"),
  respectfulPractices: z.string().min(10, "Dit veld is verplicht (minimaal 10 karakters)"),
  respectfulWorkplace: z.string().min(10, "Dit veld is verplicht (minimaal 10 karakters)"),
  boundaryBehavior: z.string().min(10, "Dit veld is verplicht (minimaal 10 karakters)"),
  discountCode: z.string().optional(),
  
  membershipType: z.enum(["klein","middelgroot","groot","offerte","Enterprise"], { required_error: "Kies je lidmaatschap" }),
  newsletter: z.boolean().default(true),
  terms: z.boolean().refine(val => val === true, {
    message: "Je moet akkoord gaan met de voorwaarden"
  })
});
interface MembershipFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membershipPlan?: {
    id: string;
    name: string;
    price: number;
    yearlyPrice: string;
  };
}
const MembershipForm = ({
  open,
  onOpenChange,
  membershipPlan
}: MembershipFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState<string>("");
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const { toast } = useToast();
  const { pricingData, loading: pricingLoading } = useMembershipPricing();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      industryRole: "",
      experienceYears: "",
      specializations: [],
      motivation: "",
      respectfulPractices: "",
      respectfulWorkplace: "",
      boundaryBehavior: "",
      discountCode: "",
      
      membershipType: (membershipPlan?.id as any) || "klein",
      newsletter: true,
      terms: false
    }
  });

  const selectedType = form.watch('membershipType');
  
  // Get pricing from database
  const getAmountFromType = (t: string) => {
    const pricing = pricingData.find(p => p.membership_type === t);
    return pricing ? pricing.price : 0;
  };
  
  const getPriceDisplayFromDb = (t: string) => {
    const pricing = pricingData.find(p => p.membership_type === t);
    return pricing ? pricing.yearly_price_display : `€${(getAmountFromType(t) / 100).toFixed(2)}`;
  };
  
  const isQuoteTier = () => {
    const pricing = pricingData.find(p => p.membership_type === selectedType);
    return pricing ? pricing.is_quote : false;
  };
  
  const baseAmount = getAmountFromType(selectedType);
  const discountAmount = appliedDiscount ? calculateDiscount(appliedDiscount, baseAmount) : 0;
  const finalAmount = baseAmount - discountAmount;
  
  const basePriceDisplay = getPriceDisplayFromDb(selectedType);
  const totalPriceDisplay = appliedDiscount
    ? `€${(finalAmount / 100).toFixed(2)}`
    : basePriceDisplay;

  const checkDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setAppliedDiscount(null);
      setDiscountError("");
      return;
    }
    
    setCheckingDiscount(true);
    setDiscountError("");
    
    const result = await validateDiscountCode(code, 'memberships', baseAmount);
    
    if (result.valid && result.discount) {
      setAppliedDiscount(result.discount);
      toast({
        title: "Kortingscode toegepast!",
        description: formatDiscountDisplay(result.discount)
      });
    } else {
      setAppliedDiscount(null);
      setDiscountError(result.error || "Ongeldige kortingscode");
    }
    
    setCheckingDiscount(false);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      // Send email notification for all membership types
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-membership-email', {
        body: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          company: values.company,
          jobTitle: values.jobTitle,
          industryRole: values.industryRole,
          experienceYears: values.experienceYears,
          specializations: values.specializations,
          motivation: values.motivation,
          respectfulPractices: values.respectfulPractices,
          respectfulWorkplace: values.respectfulWorkplace,
          boundaryBehavior: values.boundaryBehavior,
          membershipType: values.membershipType
        }
      });

      if (emailError || emailData?.error) {
        console.error('Email sending error:', emailError || emailData?.error);
        // Continue with the flow even if email fails
      }

      // Check if this is a quote tier
      const selectedPricing = pricingData.find(p => p.membership_type === values.membershipType);
      if (selectedPricing?.is_quote) {
        // Store offerte request directly in memberships table
        const { error } = await supabase
          .from('memberships')
          .insert({
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            phone: values.phone,
            company: values.company,
            job_title: values.jobTitle,
            industry_role: values.industryRole,
            experience_years: values.experienceYears,
            specializations: values.specializations,
            membership_type: values.membershipType as any,
            payment_status: 'quote_requested',
            amount: 0,
            currency: 'EUR'
          });

        if (error) {
          throw error;
        }

        toast({
          title: "Offerte aanvraag verzonden!",
          description: "We nemen binnen 2 werkdagen contact met je op voor een persoonlijke offerte.",
        });
        
        onOpenChange(false);
        form.reset();
        return;
      }

      // Regular payment flow for other membership types
      const { data, error } = await supabase.functions.invoke('create-mollie-payment', {
        body: { 
          membershipData: values,
          membershipType: (values as any).membershipType,
          amount: finalAmount, // Use finalAmount with discount applied
          discountCode: values.discountCode,
          discountAmount: discountAmount
        }
      });

      if (error || data?.error) {
        const msg = (data?.error as string) || (error?.message as string) || 'Onbekende fout';
        console.error('Payment creation error:', msg);
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
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {membershipPlan ? `${membershipPlan.name} Lidmaatschap` : 'Lid worden van Bouw met Respect'}
          </DialogTitle>
          <DialogDescription>
            {membershipPlan ? (
              <>
                Word lid van Bouw met Respect met het {membershipPlan.name} pakket voor {membershipPlan.yearlyPrice} per jaar.
                Vul het formulier volledig in om je lidmaatschap aan te vragen.
              </>
            ) : (
              <>
                Word onderdeel van onze community voor respectvolle en duurzame bouwpraktijken. 
                Vul het formulier volledig in om je lidmaatschap aan te vragen.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Lidmaatschap kiezen */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Kies je lidmaatschap</h3>
                <FormField
                  control={form.control}
                  name="membershipType"
                  render={({ field }) => (
                    <FormItem>
                       <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pricingData.map((pricing) => (
                          <Label 
                            key={pricing.membership_type}
                            htmlFor={pricing.membership_type}
                            className={`border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors block ${form.watch('membershipType')===pricing.membership_type ? 'border-accent bg-accent/10' : 'border-border'}`}
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value={pricing.membership_type} id={pricing.membership_type} />
                              <div className="flex flex-col">
                                <span className="font-medium">{pricing.membership_type.charAt(0).toUpperCase() + pricing.membership_type.slice(1)}</span>
                                <span className="text-sm">{pricing.employees_range}</span>
                                <span className="text-lg font-bold text-accent">{pricing.yearly_price_display}</span>
                              </div>
                            </div>
                          </Label>
                        ))}
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                 />
               </div>

               {/* Kortingscode sectie */}
               {!isQuoteTier() && (
                 <div className="space-y-4">
                   <h3 className="text-lg font-semibold flex items-center gap-2">
                     <Tag className="w-5 h-5" />
                     Kortingscode (optioneel)
                   </h3>
                   <FormField
                     control={form.control}
                     name="discountCode"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Kortingscode</FormLabel>
                         <div className="flex gap-2">
                           <FormControl>
                             <Input 
                               placeholder="KORTINGSCODE" 
                               {...field} 
                               className="uppercase"
                               onChange={(e) => {
                                 field.onChange(e);
                                 checkDiscountCode(e.target.value);
                               }}
                             />
                           </FormControl>
                           {checkingDiscount && (
                             <Button type="button" disabled size="sm">
                               Controleren...
                             </Button>
                           )}
                         </div>
                         {discountError && (
                           <p className="text-sm text-destructive">{discountError}</p>
                         )}
                         {appliedDiscount && (
                           <div className="flex items-center gap-2">
                             <Check className="w-4 h-4 text-green-600" />
                             <Badge variant="default" className="bg-green-100 text-green-800">
                               {formatDiscountDisplay(appliedDiscount)} toegepast
                             </Badge>
                           </div>
                         )}
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                    {/* Prijs overzicht */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Basisprijs:</span>
                        <span>{basePriceDisplay}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Korting:</span>
                          <span>-€{(discountAmount / 100).toFixed(2)}</span>
                        </div>
                      )}
                      <hr className="border-muted-foreground/20" />
                      <div className="flex justify-between font-semibold">
                        <span>Totaal:</span>
                        <span className={appliedDiscount ? "text-green-600" : ""}>{totalPriceDisplay}</span>
                      </div>
                     </div>
                 </div>
               )}

                {/* Persoonlijke gegevens */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Persoonlijke gegevens</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({
                field
              }) => <FormItem>
                      <FormLabel>Voornaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Voornaam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                <FormField control={form.control} name="lastName" render={({
                field
              }) => <FormItem>
                      <FormLabel>Achternaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Achternaam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
              <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem>
                    <FormLabel>E-mailadres</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="naam@voorbeeld.nl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="phone" render={({
              field
            }) => <FormItem>
                    <FormLabel>Telefoonnummer</FormLabel>
                    <FormControl>
                      <Input placeholder="06 12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            {/* Professionele gegevens */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Professionele achtergrond</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="company" render={({
                field
              }) => <FormItem>
                      <FormLabel>Bedrijf</FormLabel>
                      <FormControl>
                        <Input placeholder="Bedrijfsnaam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                <FormField control={form.control} name="jobTitle" render={({
                field
              }) => <FormItem>
                      <FormLabel>Functietitel</FormLabel>
                      <FormControl>
                        <Input placeholder="Projectleider, Architect, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="industryRole" render={({
                field
              }) => <FormItem>
                      <FormLabel>Rol in de bouwsector</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer je rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="architect">Architect</SelectItem>
                          <SelectItem value="projectleider">Projectleider</SelectItem>
                          <SelectItem value="aannemer">Aannemer</SelectItem>
                          <SelectItem value="bouwkundig-adviseur">Bouwkundig adviseur</SelectItem>
                          <SelectItem value="installateur">Installateur</SelectItem>
                          <SelectItem value="projectontwikkelaar">Projectontwikkelaar</SelectItem>
                          <SelectItem value="woningcorporatie">Woningcorporatie</SelectItem>
                          <SelectItem value="gemeente">Gemeente/overheid</SelectItem>
                          <SelectItem value="anders">Anders</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />
                <FormField control={form.control} name="experienceYears" render={({
                field
              }) => <FormItem>
                      <FormLabel>Ervaring in de bouw</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer ervaring" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0-2">0-2 jaar</SelectItem>
                          <SelectItem value="3-5">3-5 jaar</SelectItem>
                          <SelectItem value="6-10">6-10 jaar</SelectItem>
                          <SelectItem value="11-15">11-15 jaar</SelectItem>
                          <SelectItem value="15+">15+ jaar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />
              </div>
              <FormField control={form.control} name="specializations" render={() => <FormItem>
                    <FormLabel>Specialisaties (selecteer alle relevante opties)</FormLabel>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {[{
                  id: "duurzaam-bouwen",
                  label: "Duurzaam bouwen"
                }, {
                  id: "circulair-bouwen",
                  label: "Circulair bouwen"
                }, {
                  id: "energieneutrale-woningen",
                  label: "Energieneutrale woningen"
                }, {
                  id: "renovatie",
                  label: "Renovatie & verduurzaming"
                }, {
                  id: "sociale-woningbouw",
                  label: "Sociale woningbouw"
                }, {
                  id: "veiligheid",
                  label: "Veiligheid op de bouwplaats"
                }, {
                  id: "inclusief-bouwen",
                  label: "Inclusief bouwen"
                }, {
                  id: "gemeenschapsprojecten",
                  label: "Gemeenschapsprojecten"
                }].map(item => <FormField key={item.id} control={form.control} name="specializations" render={({
                  field
                }) => {
                  return <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value?.includes(item.id)} onCheckedChange={checked => {
                        return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter(value => value !== item.id));
                      }} />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>;
                }} />)}
                    </div>
                    <FormMessage />
                  </FormItem>} />
            </div>

            {/* Motivatie en visie */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Motivatie en visie</h3>
              <FormField control={form.control} name="motivation" render={({
              field
            }) => <FormItem>
                    <FormLabel>Waarom wil je lid worden van Bouw met Respect?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Vertel ons over je motivatie om lid te worden van onze community..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="respectfulPractices" render={({
              field
            }) => <FormItem>
                    <FormLabel>Hoe pas je respectvolle bouwpraktijken toe in je werk?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Beschrijf hoe je respect voor mensen, omgeving en gemeenschap integreert in je projecten..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="respectfulWorkplace" render={({
              field
            }) => <FormItem>
                    <FormLabel>Wat betekent een respectvolle bouwplaats voor jou?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Beschrijf wat voor jou een respectvolle bouwplaats inhoudt..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="boundaryBehavior" render={({
              field
            }) => <FormItem>
                    <FormLabel>Wat doe jij als je grensoverschrijdend gedrag opmerkt?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Beschrijf hoe je zou reageren bij grensoverschrijdend gedrag..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
            </div>

            {/* Voorkeuren en akkoord */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Voorkeuren en toestemmingen</h3>
              
              <FormField control={form.control} name="newsletter" render={({
              field
            }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Ik wil updates ontvangen over Bouw met Respect activiteiten
                  </FormLabel>
                </FormItem>} />

              <FormField control={form.control} name="terms" render={({
              field
            }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Ik ga akkoord met de{" "}
                    <Link 
                      to="/algemene-voorwaarden" 
                      className="text-primary underline hover:text-primary/80"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      algemene voorwaarden
                    </Link>
                    {" "}en het privacybeleid
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Annuleren
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting 
                  ? (isQuoteTier() ? "Offerte aanvraag verzenden..." : "Doorsturen naar betaling...") 
                  : (isQuoteTier() ? "Offerte aanvragen" : `Betaal ${totalPriceDisplay} per jaar`)
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
};
export default MembershipForm;