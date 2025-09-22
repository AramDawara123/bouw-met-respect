import { useState } from "react";
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
  motivation: z.string().optional(),
  respectfulPractices: z.string().optional(),
  respectfulWorkplace: z.string().optional(),
  boundaryBehavior: z.string().optional(),
  
  membershipType: z.enum(["klein","middelgroot","groot","offerte"], { required_error: "Kies je lidmaatschap" }),
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
  const {
    toast
  } = useToast();
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
      
      membershipType: (membershipPlan?.id as any) || "klein",
      newsletter: true,
      terms: false
    }
  });

  const selectedType = form.watch('membershipType');
  const getAmountFromType = (t: string) => t === 'middelgroot' ? 75000 : t === 'groot' ? 125000 : t === 'offerte' ? 0 : 25000;
  const displayPrice = (selectedType === 'middelgroot' ? '€750' : selectedType === 'groot' ? '€1250' : selectedType === 'offerte' ? 'Offerte op maat' : '€250');

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

      // Handle offerte requests differently
      if (values.membershipType === 'offerte') {
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
            motivation: values.motivation,
            respectful_practices: values.respectfulPractices,
            respectful_workplace: values.respectfulWorkplace,
            boundary_behavior: values.boundaryBehavior,
            membership_type: 'offerte' as any,
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
          amount: getAmountFromType((values as any).membershipType)
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
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50 ${form.watch('membershipType')==='klein' ? 'border-primary' : 'border-border'}`}
                          onClick={() => form.setValue('membershipType', 'klein')}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="klein" id="klein" />
                            <Label htmlFor="klein">Klein — €250/jaar</Label>
                          </div>
                        </div>
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50 ${form.watch('membershipType')==='middelgroot' ? 'border-primary' : 'border-border'}`}
                          onClick={() => form.setValue('membershipType', 'middelgroot')}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="middelgroot" id="middelgroot" />
                            <Label htmlFor="middelgroot">Middelgroot — €750/jaar</Label>
                          </div>
                        </div>
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50 ${form.watch('membershipType')==='groot' ? 'border-primary' : 'border-border'}`}
                          onClick={() => form.setValue('membershipType', 'groot')}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="groot" id="groot" />
                            <Label htmlFor="groot">Groot — €1250/jaar</Label>
                          </div>
                        </div>
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50 ${form.watch('membershipType')==='offerte' ? 'border-primary' : 'border-border'}`}
                          onClick={() => form.setValue('membershipType', 'offerte')}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="offerte" id="offerte" />
                            <Label htmlFor="offerte">
                              <div>
                                <div className="font-medium">Offerte op maat</div>
                                <div className="text-sm text-muted-foreground">Voor grote organisaties</div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                    <FormLabel>Waarom wil je lid worden van Bouw met Respect? <span className="text-muted-foreground">(optioneel)</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Vertel ons over je motivatie om lid te worden van onze community..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="respectfulPractices" render={({
              field
            }) => <FormItem>
                    <FormLabel>Hoe pas je respectvolle bouwpraktijken toe in je werk? <span className="text-muted-foreground">(optioneel)</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Beschrijf hoe je respect voor mensen, omgeving en gemeenschap integreert in je projecten..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="respectfulWorkplace" render={({
              field
            }) => <FormItem>
                    <FormLabel>Wat betekent een respectvolle bouwplaats voor jou? <span className="text-muted-foreground">(optioneel)</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Beschrijf wat voor jou een respectvolle bouwplaats inhoudt..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="boundaryBehavior" render={({
              field
            }) => <FormItem>
                    <FormLabel>Wat doe jij als je grensoverschrijdend gedrag opmerkt? <span className="text-muted-foreground">(optioneel)</span></FormLabel>
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
                {isSubmitting ? 
                  (selectedType === 'offerte' ? "Offerte aanvraag verzenden..." : "Doorsturen naar betaling...") : 
                  (selectedType === 'offerte' ? "Offerte aanvragen" : `Betaal ${displayPrice} per jaar`)
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
};
export default MembershipForm;