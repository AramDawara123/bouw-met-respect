import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AlgemeneVoorwaarden = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Terug naar home
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              Algemene voorwaarden
            </h1>
            <p className="text-lg text-muted-foreground">
              Bouw met Respect
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Laatst bijgewerkt: januari 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-card p-6 rounded-lg mb-8">
              <p className="text-base text-muted-foreground leading-relaxed">
                Deze algemene voorwaarden zijn van toepassing op het gebruik van de website en diensten van Bouw met Respect ("wij", "ons", "de beweging"), inclusief deelname van bedrijven aan onze beweging en het gebruik van het keurmerk. Door gebruik te maken van onze website of diensten gaat u akkoord met deze voorwaarden.
              </p>
            </div>

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">1. Definities</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">Beweging:</strong> Bouw met Respect, gericht op het bevorderen van sociale veiligheid en respect op de bouwplaats.</p>
                <p><strong className="text-foreground">Deelnemer:</strong> Elk bedrijf of individu dat zich aansluit bij de beweging.</p>
                <p><strong className="text-foreground">Keurmerk:</strong> Het bewijs van deelname aan de beweging, inclusief vermelding op de website en op een gevelbordje.</p>
                <p><strong className="text-foreground">Website:</strong> www.bouwmetrespect.nl en alle daarmee verbonden diensten en content.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">2. Toepasselijkheid</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Deze voorwaarden zijn van toepassing op:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Het gebruik van de website.</li>
                  <li>Het aanmelden van bedrijven of individuen bij de beweging.</li>
                  <li>Het gebruik van het keurmerk en de bijbehorende materialen.</li>
                </ul>
                <p>Door aanmelding of gebruik van onze diensten accepteert u deze voorwaarden volledig.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">3. Aanmelding en deelname</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Bedrijven kunnen zich aanmelden via de website door een jaarlijkse bijdrage te voldoen, afhankelijk van de grootte van het bedrijf.</li>
                  <li>Deelname is persoonlijk en niet overdraagbaar zonder schriftelijke toestemming van de beweging.</li>
                  <li>Deelname wordt pas bevestigd nadat de betaling volledig is ontvangen en verwerkt.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">4. Verplichtingen van deelnemers</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Deelnemers verplichten zich om:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>De richtlijnen van de beweging te volgen en actief te werken aan sociale veiligheid.</li>
                  <li>Coaching, trainingen en toolboxen aan te bieden of deel te nemen aan activiteiten ter bevordering van respect op de werkvloer.</li>
                  <li>Meldingen van grensoverschrijdend gedrag serieus te nemen en te handelen volgens het stappenplan van de beweging.</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">5. Gebruik van het keurmerk</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Het keurmerk mag uitsluitend gebruikt worden zolang het bedrijf actief deelneemt en de regels naleeft.</li>
                  <li>Het keurmerk mag alleen op de website, gevelbord of andere door de beweging goedgekeurde media worden gebruikt.</li>
                  <li>Indien een bedrijf de regels van de beweging overtreedt, kan de beweging het gebruik van het keurmerk intrekken. Het bordje dient te worden verwijderd en de vermelding op de website wordt ingetrokken.</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">6. Sancties bij niet-naleving</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Bij overtreding van de regels behoudt de beweging zich het recht voor om:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Het bedrijf schriftelijk te waarschuwen.</li>
                  <li>De vermelding op de website te verwijderen.</li>
                  <li>Het gevelbord terug te vorderen of instructies te geven tot verwijdering.</li>
                </ul>
                <p>Bij herhaalde of ernstige overtredingen kan deelname volledig beëindigd worden zonder terugbetaling van de jaarlijkse bijdrage.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">7. Intellectueel eigendom</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Alle content op de website, inclusief teksten, afbeeldingen en logo's, is eigendom van Bouw met Respect of de betreffende auteurs.</li>
                  <li>Het is niet toegestaan om content van de website te kopiëren, verspreiden of commercieel te gebruiken zonder toestemming.</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">8. Aansprakelijkheid</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc pl-6 space-y-2">
                  <li>De beweging spant zich in voor correcte en actuele informatie, maar is niet aansprakelijk voor schade als gevolg van het gebruik van de website of deelname aan de beweging.</li>
                  <li>Deelnemers zijn zelf verantwoordelijk voor het naleven van wet- en regelgeving binnen hun organisatie.</li>
                  <li>De beweging kan niet aansprakelijk worden gesteld voor eventuele conflicten, juridische procedures of andere schade die voortkomt uit interne bedrijfsvoering van deelnemers.</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">9. Privacy en meldpunt</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Persoonlijke gegevens worden verwerkt volgens ons privacybeleid.</li>
                  <li>Anonieme meldingen via ons meldpunt worden vertrouwelijk behandeld.</li>
                  <li>Bij ernstige of herhaalde meldingen kan de beweging contact opnemen met het betreffende bedrijf, in lijn met de gestelde procedures.</li>
                </ul>
              </div>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">10. Wijzigingen</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Bouw met Respect behoudt zich het recht voor deze algemene voorwaarden te wijzigen. Wijzigingen worden op de website gepubliceerd en gelden vanaf publicatie. Door gebruik van de website of deelname aan de beweging na publicatie van wijzigingen, accepteert u de nieuwe voorwaarden.</p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">11. Toepasselijk recht en geschillen</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Op deze voorwaarden is Nederlands recht van toepassing.</li>
                  <li>Geschillen die voortvloeien uit deelname aan de beweging of gebruik van de website zullen bij voorkeur in onderling overleg worden opgelost.</li>
                  <li>Indien nodig worden geschillen voorgelegd aan de bevoegde rechter in Nederland.</li>
                </ul>
              </div>
            </section>

            {/* Section 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">12. Contact</h2>
              <div className="bg-card p-6 rounded-lg">
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Bouw met Respect</strong></p>
                  <p>Tjalkstraat 25</p>
                  <p>1826 DT Alkmaar</p>
                  <p>Nederland</p>
                  <p><strong className="text-foreground">Telefoon:</strong> 06-39 58 03 41</p>
                  <p><strong className="text-foreground">Email:</strong> info@bouwmetrespect.nl</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgemeneVoorwaarden;