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
import SEO from "@/components/SEO";
const Index = () => {
  console.log('Index component rendering');
  try {
    return <div className="min-h-screen w-full overflow-x-hidden">
        <SEO 
          title="Bouw met Respect | Beweging voor een Veilige Bouwsector"
          description="Sluit je aan bij de beweging tegen grensoverschrijdend gedrag in de bouw. Voor een veiligere, respectvolle werkplek en aantrekkelijke sector voor jong talent."
          keywords="grensoverschrijdend gedrag bouw, veilige bouwsector, respect bouwplaats, sociale veiligheid bouw, bouwbedrijven respect"
          url="https://bouwmetrespect.nl"
        />
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