import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getInterviewPhotoDisplayUrl } from "@/lib/interviewPhotos";

interface Interview {
  id: string;
  position: number;
  name: string;
  role: string;
  intro: string;
  full_interview: string;
  image_url: string;
  is_locked: boolean;
}

const Awareness = () => {
  const { ref: awarenessRef, isVisible: awarenessVisible } = useScrollAnimation(0.1);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      const { data } = await supabase
        .from("home_interviews" as any)
        .select("*")
        .order("position", { ascending: true });
      if (data) {
        const rows = data as unknown as Interview[];
        const interviewsWithPhotos = await Promise.all(
          rows.map(async (interview) => ({
            ...interview,
            image_url: await getInterviewPhotoDisplayUrl(interview.image_url),
          }))
        );
        setInterviews(interviewsWithPhotos);
      }
    };
    fetchInterviews();
  }, []);

  if (interviews.length === 0) return null;

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
                key={item.id}
                className={`overflow-hidden border-0 shadow-lg transition-all duration-700 ${
                  awarenessVisible ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Collapsible open={isOpen} onOpenChange={(o) => setOpenIndex(o ? index : null)}>
                  <div className="aspect-[16/10] bg-muted">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                    {item.role && (
                      <p className="text-sm text-primary font-medium mb-2">{item.role}</p>
                    )}
                    {item.intro && (
                      <p className="text-sm text-muted-foreground mb-4">{item.intro}</p>
                    )}

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
                        {item.full_interview}
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
