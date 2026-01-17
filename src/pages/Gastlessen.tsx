import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import { 
  GraduationCap, 
  Users, 
  Building2, 
  Presentation, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Target,
  MessageCircle,
  Award,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import heroImage from '@/assets/landing-team-meeting.jpg';

const Gastlessen = () => {
  const offerings = [
    {
      icon: GraduationCap,
      title: 'Gastlessen op scholen',
      description: 'Interactieve lessen voor MBO, HBO en universitaire opleidingen in de bouw- en technieksector.',
      features: ['Aangepast aan opleidingsniveau', 'Praktijkvoorbeelden', 'Interactieve werkvormen']
    },
    {
      icon: Presentation,
      title: 'Bedrijfspresentaties',
      description: 'Professionele presentaties voor bouwbedrijven, aannemers en technische organisaties.',
      features: ['Op locatie of online', 'Maatwerkinhoud', 'Q&A sessies']
    },
    {
      icon: Users,
      title: 'Teamtrainingen',
      description: 'Diepgaande workshops voor teams om bewustzijn te creëren en gedrag te veranderen.',
      features: ['Halve of hele dag', 'Rollenspelen', 'Actieplannen']
    },
    {
      icon: Building2,
      title: 'Toolbox meetings',
      description: 'Korte, krachtige sessies die perfect passen binnen bestaande toolbox momenten.',
      features: ['15-30 minuten', 'Praktisch toepasbaar', 'Laagdrempelig']
    }
  ];

  const topics = [
    { icon: Target, title: 'Herkennen van grensoverschrijdend gedrag' },
    { icon: MessageCircle, title: 'Effectief communiceren en aanspreken' },
    { icon: Users, title: 'Creëren van een veilige werksfeer' },
    { icon: Award, title: 'Leiderschap en voorbeeldgedrag' },
    { icon: BookOpen, title: 'Wet- en regelgeving' },
    { icon: Lightbulb, title: 'Preventie en interventie strategieën' }
  ];

  const benefits = [
    'Erkende expertise in de bouwsector',
    'Praktijkgerichte aanpak',
    'Flexibele planning',
    'Materialen inbegrepen',
    'Evaluatie en follow-up',
    'Certificaat van deelname'
  ];

  return (
    <>
      <SEO 
        title="Gastlessen & Presentaties | Bouw met Respect"
        description="Boek een gastles of presentatie over respectvol samenwerken in de bouw. Geschikt voor scholen, bedrijven en organisaties. Creëer bewustzijn en voorkom grensoverschrijdend gedrag."
      />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/70" />
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <GraduationCap className="w-5 h-5 text-white" />
              <span className="text-white/90 text-sm font-medium">Educatie & Bewustwording</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Gastlessen & Presentaties
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Creëer bewustzijn over respectvol samenwerken in de bouw. 
              Van interactieve gastlessen tot professionele bedrijfspresentaties.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/#contact">
                <Button size="lg" className="text-lg px-10 py-7 bg-accent hover:bg-accent/90 text-white shadow-2xl transition-all duration-300 hover:scale-105">
                  Vraag een gastles aan <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
              <a href="tel:+31612345678">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  Bel voor meer info
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Wat bieden wij aan?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Van korte toolbox meetings tot uitgebreide trainingen - wij hebben voor elke situatie een passend aanbod.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {offerings.map((offering, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                      <offering.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">{offering.title}</h3>
                      <p className="text-muted-foreground mb-4">{offering.description}</p>
                      <ul className="space-y-2">
                        {offering.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Onderwerpen die aan bod komen
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Onze gastlessen en presentaties behandelen alle relevante aspecten van respectvol samenwerken.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {topics.map((topic, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-6 bg-background rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="p-3 bg-accent/10 rounded-xl">
                  <topic.icon className="w-6 h-6 text-accent" />
                </div>
                <span className="font-medium text-foreground">{topic.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/95 to-accent/80 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Waarom kiezen voor Bouw met Respect?
                </h2>
                <p className="text-lg text-white/90 mb-8">
                  Met jarenlange ervaring in de bouwsector begrijpen wij de unieke uitdagingen en cultuur. 
                  Onze aanpak is praktisch, herkenbaar en direct toepasbaar.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                      <span className="text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <Clock className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Flexibele opties</h3>
                  <p className="text-white/80">Kies wat bij uw organisatie past</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span>Toolbox meeting</span>
                    <span className="font-semibold">15-30 min</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span>Gastles</span>
                    <span className="font-semibold">45-90 min</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span>Workshop</span>
                    <span className="font-semibold">Halve dag</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span>Training</span>
                    <span className="font-semibold">Hele dag</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Interesse in een gastles of presentatie?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Neem vrijblijvend contact met ons op om de mogelijkheden te bespreken. 
              Wij denken graag mee over de beste aanpak voor uw situatie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/#contact">
                <Button size="lg" className="text-lg px-10 py-7 bg-primary hover:bg-primary/90 shadow-xl transition-all duration-300 hover:scale-105">
                  Neem contact op <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/partner">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-primary/50 text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105">
                  Word partner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Gastlessen;
