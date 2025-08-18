
import Hero from "@/components/Hero";
import MissionStatement from "@/components/MissionStatement";
import Mission from "@/components/Mission";
import ActionItems from "@/components/ActionItems";
import Testimonial from "@/components/Testimonial";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <MissionStatement />
      <ActionItems />
      <Mission />
      <Testimonial />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
