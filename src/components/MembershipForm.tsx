import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
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
  motivation: z.string().min(50, "Motivatie moet minimaal 50 karakters bevatten"),
  respectfulPractices: z.string().min(30, "Beschrijf hoe je respectvolle bouwpraktijken toepast"),
  respectfulWorkplace: z.string().min(30, "Beschrijf wat een respectvolle bouwplaats voor jou betekent"),
  boundaryBehavior: z.string().min(30, "Beschrijf hoe je reageert op grensoverschrijdend gedrag"),
  merchandiseMotivation: z.string().min(30, "Vertel waarom je bouw met respect merchandise koopt"),
  allowStorySharing: z.boolean().default(false),
  anonymousSharing: z.boolean().default(false),
  newsletter: z.boolean().default(true),
  terms: z.boolean().refine(val => val === true, {
    message: "Je moet akkoord gaan met de voorwaarden"
  })
});
interface MembershipFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const MembershipForm = ({
  open,
  onOpenChange
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
      merchandiseMotivation: "",
      allowStorySharing: false,
      anonymousSharing: false,
      newsletter: true,
      terms: false
    }
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    // Simuleer API call - hier zou je normaal een echte API aanroep doen
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Lidmaatschap aanvraag:", values);
    toast({
      title: "Aanvraag verzonden!",
      description: "We beoordelen je aanvraag en nemen binnen 2 werkdagen contact met je op."
    });
    form.reset();
    onOpenChange(false);
    setIsSubmitting(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lid worden van Bouw met Respect</DialogTitle>
          <DialogDescription>
            Word onderdeel van onze community voor respectvolle en duurzame bouwpraktijken. 
            Vul het formulier volledig in om je lidmaatschap aan te vragen.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              
              <FormField control={form.control} name="merchandiseMotivation" render={({
              field
            }) => <FormItem>
                    <FormLabel>Waarom koop jij bouw met respect merchandise?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Vertel waarom je geinteresseerd bent in onze merchandise..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            {/* Voorkeuren en akkoord */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Voorkeuren en toestemmingen</h3>
              
              <FormField control={form.control} name="allowStorySharing" render={({
              field
            }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Ik geef toestemming om mijn verhaal te delen voor bewustwording
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Je verhaal kan gebruikt worden op sociale media en andere platforms om andere mensen te helpen en bewustzijn te creëren over respectvolle bouwpraktijken
                    </p>
                  </div>
                </FormItem>} />

              {form.watch("allowStorySharing") && <FormField control={form.control} name="anonymousSharing" render={({
              field
            }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ml-6">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Deel mijn verhaal anoniem
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Je verhaal wordt gedeeld zonder je naam, bedrijfsnaam of andere identificeerbare informatie
                      </p>
                    </div>
                  </FormItem>} />}

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
            }) => {}} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Annuleren
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Aanvraag indienen..." : "Lidmaatschap aanvragen"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
};
export default MembershipForm;