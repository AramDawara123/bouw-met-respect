import Hero from "@/components/Hero";
import MissionStatement from "@/components/MissionStatement";
import Mission from "@/components/Mission";
import Statistics from "@/components/Statistics";
import Awareness from "@/components/Awareness";
import ActionItems from "@/components/ActionItems";
import ReportSection from "@/components/ReportSection";
import Testimonial from "@/components/Testimonial";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MembershipPlans from "@/components/MembershipPlans";
import { Building } from "lucide-react";
const Index = () => {
  console.log('Index component rendering');
  
  try {
    return <div className="min-h-screen w-full overflow-x-hidden">
        <Hero />
        <MissionStatement />
        <Statistics />
        <Awareness />
        <ActionItems />
        
        {/* Membership Plans Section */}
        <section className="py-16 bg-background/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Lidmaatschappen</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Kies het lidmaatschap dat bij jouw bedrijf past en help mee aan een betere bouwsector
              </p>
            </div>
            <MembershipPlans />
          </div>
        </section>
        
        <ReportSection />
        <Mission />
        <Testimonial />
        <FAQ />
        <CallToAction />
        <Contact />
        <Footer />
      </div>;
  } catch (error) {
    console.error('Error in Index component:', error);
    throw error;
  }
};
export default Index;