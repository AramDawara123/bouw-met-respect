import { Card } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
const Awareness = () => {
  const {
    ref: awarenessRef,
    isVisible: awarenessVisible
  } = useScrollAnimation(0.1);
  const awarenessItems = [{
    image: "/lovable-uploads/af5847a3-a5b8-4469-a490-1a2dd06dd44b.png",
    title: "Herken de signalen",
    subtitle: "Grensoverschrijdend gedrag is niet altijd zichtbaar",
    description: "Leer de subtiele signalen herkennen van grensoverschrijdend gedrag op de werkplek."
  }, {
    image: "/lovable-uploads/0aa319ff-868a-4104-9b80-da10435fc7c7.png",
    title: "Zwakke fundatie",
    subtitle: "De fundatie van onze bouwcultuur is te zwak",
    description: "De huidige cultuur in de bouw houdt geen stand meer. Tijd voor een sterke nieuwe basis."
  }, {
    image: "/lovable-uploads/af266479-6043-45e9-8c66-dfb97bebf09b.png",
    title: "Bouw mee",
    subtitle: "Aan een respectvolle werkomgeving",
    description: "Sluit je aan bij onze beweging voor een veiligere en respectvollere bouwsector."
  }];
  return;
};
export default Awareness;