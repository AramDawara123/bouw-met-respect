
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Wat is 'Bouw met Respect' precies?",
      answer: "Bouw met Respect is een community-gedreven initiatief dat zich richt op het creëren van een veiligere, respectvolle en inclusieve werkplek in de bouwsector. We bieden tools, training en ondersteuning om bedrijven en professionals te helpen bij het doorvoeren van positieve veranderingen."
    },
    {
      question: "Hoe kan mijn bedrijf zich aansluiten?",
      answer: "Bedrijven kunnen zich eenvoudig aansluiten door contact met ons op te nemen. We bieden verschillende programma's, van bewustwordingssessies tot complete cultuurveranderingstrajecten, aangepast aan de specifieke behoeften van uw organisatie."
    },
    {
      question: "Is deelname aan de community gratis?",
      answer: "Ja, deelname aan onze basiscommunity is volledig gratis. We geloven dat iedereen toegang moet hebben tot informatie en hulpmiddelen voor het creëren van een betere werkplek. Voor bedrijfsspecifieke programma's zijn er wel kosten verbonden."
    },
    {
      question: "Wat voor soort training bieden jullie aan?",
      answer: "We bieden verschillende trainingen aan, zoals: bewustwording rond grensoverschrijdend gedrag, effectieve communicatie op de bouwplaats, inclusief leiderschap, en conflict management. Alle trainingen zijn praktijkgericht en specifiek ontwikkeld voor de bouwsector."
    },
    {
      question: "Hoe meten jullie de impact van jullie werk?",
      answer: "We meten onze impact door regelmatige surveys onder community leden, feedback van deelnemende bedrijven, en concrete cijfers zoals retentie van jonge professionals en gerapporteerde incidenten. Transparantie in onze resultaten is belangrijk voor ons."
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
              Vind antwoorden op de meest gestelde vragen over onze missie en aanpak.
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
