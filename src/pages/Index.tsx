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
        <MembershipPlans />
        
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