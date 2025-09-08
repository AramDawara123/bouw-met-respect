import Hero from "@/components/Hero";
import MissionStatement from "@/components/MissionStatement";
import Mission from "@/components/Mission";
import Statistics from "@/components/Statistics";
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
  return <div className="min-h-screen w-full overflow-x-hidden">
      <Hero />
      <MissionStatement />
      <Statistics />
      <ActionItems />
      
      {/* Membership Plans Section */}
      <section className="py-24 bg-gradient-to-br from-background via-primary/5 to-secondary/5 relative overflow-hidden">
        {/* Background decoration */}
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl opacity-50"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm rounded-full text-primary font-semibold text-sm mb-8 border border-primary/20">
              <Building className="w-4 h-4 mr-2" />
              Lidmaatschappen
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground leading-tight">
              Kies het juiste <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                lidmaatschap
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Verschillende pakketten voor verschillende bedrijfsgroottes. 
              Allemaal gericht op het creëren van een respectvolle bouwsector.
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
};
export default Index;