import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, Phone, Mail } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import ReportForm from "@/components/ReportForm";

const ReportSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);
  const [reportFormOpen, setReportFormOpen] = useState(false);

  return (
    <section id="melding" className="py-24 bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto px-4">
        <div 
          ref={ref}
          className={`transition-all duration-1000 ${
            isVisible 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform translate-y-8'
          }`}
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-red-500/10 rounded-full text-red-600 font-semibold text-sm mb-6">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Veilige melding
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Meld grensoverschrijdend gedrag
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
              Je veiligheid en welzijn zijn belangrijk. Meld grensoverschrijdend gedrag veilig en vertrouwelijk.
              Samen zorgen we voor een respectvolle bouwplaats voor iedereen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            <Card className="p-8 border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-600/5">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    Online melding
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Vul ons veilige meldformulier in. Je kunt kiezen voor een anonieme melding of 
                    je contactgegevens achterlaten voor follow-up.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      Volledig vertrouwelijk
                    </li>
                    <li className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      Anoniem mogelijk
                    </li>
                    <li className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      24/7 beschikbaar
                    </li>
                  </ul>
                  <Button 
                    onClick={() => setReportFormOpen(true)}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Melding maken
                    <Shield className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-600/5">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    Direct contact
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Bij spoedeisende situaties kun je ook direct contact met ons opnemen 
                    via telefoon of e-mail.
                  </p>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-foreground">06-39 58 03 41</p>
                        <p className="text-xs text-muted-foreground">Ma-vr 09:00-17:00</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-foreground">meldpunt@bouwmetrespect.nl</p>
                        <p className="text-xs text-muted-foreground">Reactie binnen 24 uur</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={() => window.location.href = 'tel:0639580341'}
                  >
                    Bel nu
                    <Phone className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              <strong>Vertrouwelijkheid gegarandeerd:</strong> Alle meldingen worden strikt vertrouwelijk behandeld. 
              We werken samen met je om de situatie op een veilige en respectvolle manier aan te pakken.
            </p>
          </div>
        </div>
      </div>

      <ReportForm open={reportFormOpen} onOpenChange={setReportFormOpen} />
    </section>
  );
};

export default ReportSection;