
import Hero from "@/components/Hero";
import MissionStatement from "@/components/MissionStatement";
import Mission from "@/components/Mission";
import Statistics from "@/components/Statistics";
import ActionItems from "@/components/ActionItems";
import Testimonial from "@/components/Testimonial";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Hero />
      <MissionStatement />
      <Statistics />
      <ActionItems />
      <Mission />
      <Testimonial />
      <FAQ />
      <CallToAction />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
