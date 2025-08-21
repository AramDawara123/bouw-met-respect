
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Wat betekent sociale veiligheid in de bouw?",
      answer: "Sociale veiligheid in de bouw betekent dat elke werknemer zich veilig, gerespecteerd en gewaardeerd voelt op de bouwplaats. Het gaat om het voorkomen van grensoverschrijdend gedrag, intimidatie, discriminatie en het creëren van een inclusieve werkcultuur waar iedereen zichzelf kan zijn."
    },
    {
      question: "Waarom is respect op de bouwplaats zo belangrijk?",
      answer: "Respect op de werkvloer zorgt niet alleen voor betere samenwerking en veiligheid, maar ook voor het behouden van jong talent. Een respectvolle cultuur maakt de bouwsector aantrekkelijker voor nieuwe generaties en voorkomt dat ervaren krachten afhaken door negatieve ervaringen."
    },
    {
      question: "Hoe kan mijn bedrijf aansluiten bij Bouw met Respect?",
      answer: "Bedrijven kunnen zich aansluiten door contact met ons op te nemen via het contactformulier. We bieden verschillende programma's: van bewustwordingsworkshops tot complete cultuurveranderingstrajecten. Onze aanpak wordt altijd aangepast aan de specifieke behoeften van uw organisatie."
    },
    {
      question: "Kan ik ook individueel deelnemen aan de community?",
      answer: "Ja, absoluut! Onze community staat open voor alle professionals in de bouw - van ervaren vakspecialisten tot jongeren die net beginnen. Individuele deelname is gratis en biedt toegang tot onze online community, ervaringen delen en ondersteuning krijgen van collega's uit de sector."
    },
    {
      question: "Wat voor concrete resultaten kunnen we verwachten?",
      answer: "Bedrijven die actief werken aan cultuurverandering zien vaak binnen 6 maanden verbetering in werksfeer, lagere verloop onder jonge medewerkers en minder meldingen van grensoverschrijdend gedrag. 73% van onze community-leden rapporteert zich meer gesteund te voelen in hun werk."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Veelgestelde vragen
            </h2>
            <p className="text-xl text-muted-foreground">
              Alles wat je wilt weten over sociale veiligheid in de bouw, 
              grensoverschrijdend gedrag aanpakken en hoe wij de sector 
              aantrekkelijker maken voor jong talent.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 bg-card overflow-hidden">
                <Button
                  variant="ghost"
                  className="w-full p-6 h-auto justify-between text-left hover:bg-muted/50"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </Button>
                
                {openIndex === index && (
                  <div className="px-6 pb-6 animate-slide-down">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
