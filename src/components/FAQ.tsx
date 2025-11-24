import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Wat is Bouw met Respect?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bouw met Respect is een beweging die zich inzet voor een veiligere en respectvolle bouwsector. We strijden tegen grensoverschrijdend gedrag en werken aan cultuurverandering in de bouw."
        }
      },
      {
        "@type": "Question",
        "name": "Hoe kan ik meedoen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Je kunt lid worden van onze beweging door je aan te melden via het formulier op onze website. Bedrijven kunnen partnerbedrijf worden."
        }
      },
      {
        "@type": "Question",
        "name": "Wat houdt grensoverschrijdend gedrag in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Grensoverschrijdend gedrag omvat intimidatie, discriminatie, pesten, seksuele intimidatie en andere vormen van ongewenst gedrag op de werkplek."
        }
      },
      {
        "@type": "Question",
        "name": "Hoe meld ik een incident?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Je kunt via ons anonieme meldformulier een incident melden. We behandelen alle meldingen vertrouwelijk en nemen ze serieus."
        }
      },
      {
        "@type": "Question",
        "name": "Is lidmaatschap gratis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, individueel lidmaatschap is gratis. Voor bedrijven hebben we verschillende partnerschappen beschikbaar."
        }
      },
      {
        "@type": "Question",
        "name": "Wat doen jullie met meldingen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We behandelen alle meldingen vertrouwelijk en gebruiken ze om trends te signaleren en bedrijven te ondersteunen bij het verbeteren van hun werkomgeving."
        }
      }
    ]
  };

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
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-foreground">
              Veelgestelde vragen
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4 sm:px-0">
              Alles wat je wilt weten over sociale veiligheid in de bouw, 
              grensoverschrijdend gedrag aanpakken en hoe wij de sector 
              aantrekkelijker maken voor jong talent.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 bg-card overflow-hidden">
                <Button
                  variant="ghost"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-panel-${index}`}
                  className="w-full p-4 sm:p-5 md:p-6 h-auto justify-between items-start text-left hover:bg-muted/50 whitespace-normal"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="flex-1 min-w-0 text-base sm:text-lg md:text-xl font-semibold text-foreground pr-3 sm:pr-4 md:pr-5 leading-snug break-words">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 md:w-6 md:h-6 text-accent flex-shrink-0 self-start mt-0.5" />
                  ) : (
                    <Plus className="w-5 h-5 md:w-6 md:h-6 text-accent flex-shrink-0 self-start mt-0.5" />
                  )}
                </Button>
                
                {openIndex === index && (
                  <div
                      id={`faq-panel-${index}`}
                      role="region"
                      className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 animate-slide-down"
                    >
                      <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
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
