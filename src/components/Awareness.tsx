import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Interview {
  image: string;
  name: string;
  role: string;
  alt: string;
  intro: string;
  fullInterview: string;
}

const Awareness = () => {
  const { ref: awarenessRef, isVisible: awarenessVisible } = useScrollAnimation(0.1);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // De bestuurder blijft altijd de eerste foto.
  const interviews: Interview[] = [
    {
      image: "/lovable-uploads/af5847a3-a5b8-4469-a490-1a2dd06dd44b.png",
      name: "Bestuurder Stichting Bouw met Respect",
      role: "Oprichter & Bestuurder",
      alt: "Bestuurder Stichting Bouw met Respect",
      intro:
        "Waarom ik deze stichting ben begonnen en wat psychologische veiligheid op de bouwplaats voor mij betekent.",
      fullInterview:
        "Hier komt het volledige interview met de bestuurder. (Plaatshouder — vervang deze tekst via de code of een toekomstig admin-paneel met het echte interview.)\n\nVertel hier over de aanleiding, de missie, en wat je hoopt te bereiken voor de volgende generatie vakmensen in de bouw.",
    },
    {
      image: "/lovable-uploads/0aa319ff-868a-4104-9b80-da10435fc7c7.png",
      name: "Verhaal uit de bouw",
      role: "Vakman",
      alt: "Verhaal van een vakman uit de bouw",
      intro: "Een eerlijk verhaal over de cultuur op de bouwplaats en wat er moet veranderen.",
      fullInterview:
        "Plaatshouder — vervang deze tekst met het volledige interview.",
    },
    {
      image: "/lovable-uploads/af266479-6043-45e9-8c66-dfb97bebf09b.png",
      name: "Samen bouwen aan respect",
      role: "Partner",
      alt: "Samen bouwen aan een respectvolle bouwsector",
      intro: "Hoe wij als partner bijdragen aan een veilige en respectvolle werkomgeving.",
      fullInterview:
        "Plaatshouder — vervang deze tekst met het volledige interview.",
    },
  ];

  return (
    <section id="probleem" className="py-16 px-4" ref={awarenessRef}>
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Verhalen uit de bouw
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Klik op een foto en lees het volledige interview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {interviews.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <Card
                key={index}
                className={`overflow-hidden border-0 shadow-lg transition-all duration-700 ${
                  awarenessVisible ? "animate-fade-in" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Collapsible open={isOpen} onOpenChange={(o) => setOpenIndex(o ? index : null)}>
                  <div className="aspect-[16/10] bg-muted">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-primary font-medium mb-2">{item.role}</p>
                    <p className="text-sm text-muted-foreground mb-4">{item.intro}</p>

                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {isOpen ? "Verberg interview" : "Lees het gehele interview"}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                      <div className="pt-4 text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                        {item.fullInterview}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Awareness;
