import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle } from "lucide-react";

const reportSchema = z.object({
  reporterName: z.string().optional(),
  reporterEmail: z.string().email("Voer een geldig e-mailadres in").optional().or(z.literal("")),
  reporterPhone: z.string().optional(),
  company: z.string().min(2, "Bedrijfsnaam is verplicht"),
  incidentDate: z.string().min(1, "Datum is verplicht"),
  incidentLocation: z.string().min(5, "Locatie moet minimaal 5 karakters bevatten"),
  incidentType: z.string({
    required_error: "Selecteer het type grensoverschrijdend gedrag"
  }),
  incidentDescription: z.string().min(20, "Beschrijving moet minimaal 20 karakters bevatten"),
  witnessPresent: z.enum(["yes", "no", "unknown"]),
  actionTaken: z.string().optional(),
  socialMediaSharing: z.enum(["yes", "no"], {
    required_error: "Geef aan of we dit mogen delen op sociale media"
  }),
  anonymous: z.boolean().default(false),
  followUp: z.boolean().default(true)
});

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportForm = ({ open, onOpenChange }: ReportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reporterName: "",
      reporterEmail: "",
      reporterPhone: "",
      company: "",
      incidentDate: "",
      incidentLocation: "",
      incidentType: "",
      incidentDescription: "",
      witnessPresent: "unknown",
      actionTaken: "",
      socialMediaSharing: "no",
      anonymous: false,
      followUp: true
    }
  });

  const watchAnonymous = form.watch("anonymous");

  const onSubmit = async (values: z.infer<typeof reportSchema>) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Melding grensoverschrijdend gedrag:", values);
    
    toast({
      title: "Melding verzonden",
      description: "Dank je wel voor je melding. We nemen dit serieus en zullen passende actie ondernemen."
    });
    
    form.reset();
    onOpenChange(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Melding grensoverschrijdend gedrag
          </DialogTitle>
          <DialogDescription>
            Je melding wordt vertrouwelijk behandeld. Als je anoniem wilt blijven, laat dan de persoonlijke velden leeg.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Anonymous option */}
            <FormField
              control={form.control}
              name="anonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">
                      Anonieme melding
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Vink aan als je anoniem wilt blijven. Persoonlijke gegevens zijn dan niet verplicht.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Personal information - optional for anonymous reports */}
            {!watchAnonymous && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Jouw gegevens (optioneel bij anonieme melding)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reporterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Naam</FormLabel>
                        <FormControl>
                          <Input placeholder="Voor- en achternaam" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reporterEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mailadres</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="naam@voorbeeld.nl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="reporterPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefoonnummer (optioneel)</FormLabel>
                      <FormControl>
                        <Input placeholder="06 12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Incident details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Details van het incident</h3>
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bij welk bedrijf vond dit plaats?</FormLabel>
                    <FormControl>
                      <Input placeholder="Bedrijfsnaam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="incidentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datum van incident</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="incidentLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locatie</FormLabel>
                      <FormControl>
                        <Input placeholder="Bouwplaats, kantoor, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="incidentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type grensoverschrijdend gedrag</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer type gedrag" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="verbal-harassment">Verbale intimidatie/pesterij</SelectItem>
                        <SelectItem value="discrimination">Discriminatie</SelectItem>
                        <SelectItem value="sexual-harassment">Seksuele intimidatie</SelectItem>
                        <SelectItem value="physical-aggression">Fysieke agressie</SelectItem>
                        <SelectItem value="unsafe-behavior">Onveilig werkgedrag</SelectItem>
                        <SelectItem value="bullying">Pesten/mobbing</SelectItem>
                        <SelectItem value="other">Anders</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incidentDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschrijving van het incident</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Beschrijf zo gedetailleerd mogelijk wat er gebeurde..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="witnessPresent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waren er getuigen aanwezig?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="witness-yes" />
                          <label htmlFor="witness-yes" className="text-sm cursor-pointer">Ja</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="witness-no" />
                          <label htmlFor="witness-no" className="text-sm cursor-pointer">Nee</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="unknown" id="witness-unknown" />
                          <label htmlFor="witness-unknown" className="text-sm cursor-pointer">Weet ik niet</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actionTaken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is er al actie ondernomen? (optioneel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Beschrijf welke actie er eventueel al ondernomen is..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Social media sharing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Delen op sociale media</h3>
              
              <FormField
                control={form.control}
                name="socialMediaSharing"
                render={({ field }) => (
                  <FormItem className="rounded-md border p-4">
                    <FormLabel className="text-base font-medium">
                      Mogen we dit verhaal (geanonimiseerd) delen op sociale media voor bewustwording?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3 pt-2"
                      >
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="yes" id="social-yes" />
                          <div className="space-y-1 leading-none">
                            <label htmlFor="social-yes" className="text-sm font-normal cursor-pointer">
                              Ja, dit verhaal mag gedeeld worden
                            </label>
                            <p className="text-xs text-muted-foreground">
                              We delen het verhaal volledig geanonimiseerd voor bewustwording
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="no" id="social-no" />
                          <div className="space-y-1 leading-none">
                            <label htmlFor="social-no" className="text-sm font-normal cursor-pointer">
                              Nee, dit verhaal mag niet gedeeld worden
                            </label>
                            <p className="text-xs text-muted-foreground">
                              Het verhaal blijft vertrouwelijk en wordt alleen intern gebruikt
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followUp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Ik wil op de hoogte gehouden worden van vervolgacties
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        We informeren je over de stappen die worden ondernomen (alleen mogelijk bij niet-anonieme meldingen)
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Annuleren
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Verzenden..." : "Melding verzenden"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;