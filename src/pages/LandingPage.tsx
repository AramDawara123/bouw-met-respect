import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Building2, Phone, ArrowRight, CheckCircle, MapPin, Heart, MessageCircle, Award, Target } from 'lucide-react';
import MembershipForm from '@/components/MembershipForm';
import { useState } from 'react';
import Footer from '@/components/Footer';
import heroImage from '@/assets/landing-hero-construction.jpg';
import workerPortrait from '@/assets/landing-worker-portrait.jpg';
import teamMeeting from '@/assets/landing-team-meeting.jpg';

interface LandingPageData {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  meta_keywords: string | null;
  region: string | null;
  industry: string | null;
  problem_type: string | null;
  h1_title: string;
  intro_text: string;
  main_content: string;
  statistics: Record<string, any>;
  solutions_text: string | null;
  cta_text: string | null;
  schema_markup: Record<string, any>;
}

const LandingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showMembershipForm, setShowMembershipForm] = useState(false);

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['landing-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data as LandingPageData;
    },
    enabled: !!slug,
  });

  // Fetch regional partners
  const { data: partners } = useQuery({
    queryKey: ['regional-partners', page?.region],
    queryFn: async () => {
      const { data } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('is_featured', true)
        .limit(6);
      return data || [];
    },
    enabled: !!page?.region,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
            <Shield className="absolute inset-0 m-auto w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground animate-pulse">Pagina laden...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pagina niet gevonden</h1>
          <p className="text-muted-foreground">De pagina die je zoekt bestaat niet of is verplaatst.</p>
        </div>
        <Link to="/">
          <Button size="lg" className="gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Terug naar home
          </Button>
        </Link>
      </div>
    );
  }

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.title,
    "description": page.meta_description,
    "url": `https://bouwmetrespect.nl/${page.slug}`,
    "publisher": {
      "@type": "Organization",
      "name": "Stichting Bouw met Respect",
      "url": "https://bouwmetrespect.nl"
    },
    ...(page.region && {
      "about": {
        "@type": "Place",
        "name": page.region
      }
    }),
    ...page.schema_markup
  };

  // Mission-focused goals instead of achieved results
  const missionGoals = [
    { value: '1 op 5', label: 'Bouwvakkers ervaart grensoverschrijdend gedrag', icon: Users },
    { value: '100%', label: 'Vertrouwelijke behandeling van meldingen', icon: Shield },
    { value: '24/7', label: 'Bereikbaar voor ondersteuning', icon: Phone },
    { value: '0', label: 'Tolerantie voor ongewenst gedrag', icon: Heart },
  ];

  return (
    <>
      <SEO
        title={page.title}
        description={page.meta_description}
        keywords={page.meta_keywords || undefined}
        url={`https://bouwmetrespect.nl/${page.slug}`}
      />
      
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      <div className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section with Image Background */}
        <section className="relative min-h-[85vh] flex items-center">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt="Bouwvakkers op een bouwplaats"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent" />
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl animate-fade-in">
              {page.region && (
                <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-full mb-8 animate-bounce-in shadow-lg">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">Regio {page.region}</span>
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight animate-slide-up">
                {page.h1_title}
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-3xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {page.intro_text}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-7 bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl hover:shadow-accent/25 transition-all duration-300 hover:scale-105"
                  onClick={() => setShowMembershipForm(true)}
                >
                  Sluit je aan <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
                <Link to="/partner">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                    Word partner
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Vertrouwelijk meldpunt</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Professionele ondersteuning</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Landelijk netwerk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
            </div>
          </div>
        </section>

        {/* Mission Goals Section */}
        <section className="py-20 bg-gradient-to-b from-muted/50 to-background relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.05),transparent_50%)]" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Onze missie</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Waar Wij Voor Staan
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Samen bouwen we aan een veiligere en respectvollere bouwsector in {page.region || 'Nederland'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {missionGoals.map((goal, index) => (
                <Card 
                  key={goal.label} 
                  className="text-center border-none shadow-xl bg-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in group overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="pt-8 pb-6 relative">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <goal.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3">
                      {goal.value}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium leading-tight">
                      {goal.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Section with Image */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Image Side */}
              <div className="relative animate-fade-in order-2 lg:order-1">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={teamMeeting} 
                    alt="Bouwteam in overleg"
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />
                </div>
                
                {/* Floating Card */}
                <Card className="absolute -bottom-8 -right-8 p-6 shadow-2xl bg-card border-none max-w-xs animate-bounce-in hidden md:block">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-7 h-7 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Veilige werkomgeving</p>
                      <p className="text-sm text-muted-foreground">Voor iedereen in de bouw</p>
                    </div>
                  </div>
                </Card>

                {/* Decorative Element */}
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-2xl -z-10" />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-accent/20 rounded-xl -z-10" />
              </div>

              {/* Content Side */}
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Ons verhaal</span>
                </div>
                
                <div 
                  className="prose prose-lg max-w-none text-foreground 
                    prose-headings:text-foreground prose-headings:font-bold
                    prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-ul:text-muted-foreground prose-li:marker:text-primary
                    prose-strong:text-foreground"
                  dangerouslySetInnerHTML={{ __html: page.main_content }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section with Modern Cards */}
        {page.solutions_text && (
          <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,hsl(var(--accent)/0.1),transparent_50%)]" />
            
            <div className="container mx-auto px-4 relative">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full mb-6">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Onze oplossingen</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                  Wat Wij Bieden in {page.region || 'Uw Regio'}
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Concrete hulp en ondersteuning voor een veiligere werkomgeving
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {[
                  { icon: Shield, title: 'Preventie & Training', desc: 'Voorkom grensoverschrijdend gedrag met onze trainingen en bewustwordingsprogramma\'s.', color: 'primary' },
                  { icon: Users, title: 'Netwerk & Support', desc: 'Verbind met gelijkgestemde professionals die respect voorop stellen.', color: 'accent' },
                  { icon: Building2, title: 'Certificering', desc: 'Toon aan dat uw bedrijf zich inzet voor een veilige werkomgeving.', color: 'primary' }
                ].map((item, index) => (
                  <Card 
                    key={item.title}
                    className="group relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-scale-in bg-card"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 bg-${item.color}`} />
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 rounded-2xl bg-${item.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className={`w-8 h-8 text-${item.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="max-w-4xl mx-auto">
                <Card className="border-none shadow-xl bg-card overflow-hidden">
                  <CardContent className="p-8 md:p-12">
                    <div 
                      className="prose prose-lg max-w-none text-foreground
                        prose-p:text-muted-foreground prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: page.solutions_text }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Mission Statement Section */}
        <section className="py-20 bg-secondary relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full mb-8">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">Onze belofte</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Wij geloven in een bouwsector waar respect de norm is
              </h2>
              
              <p className="text-xl text-white/90 leading-relaxed mb-8">
                Grensoverschrijdend gedrag hoort nergens thuis. Wij zetten ons in voor een veilige 
                werkplek waar iedereen met plezier kan werken. Een plek waar problemen bespreekbaar 
                zijn en waar je ondersteuning krijgt wanneer je die nodig hebt.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left">
                  <Shield className="w-8 h-8 text-accent mb-4" />
                  <h3 className="text-white font-semibold mb-2">Vertrouwelijk</h3>
                  <p className="text-white/70 text-sm">Alle meldingen worden strikt vertrouwelijk behandeld</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left">
                  <Users className="w-8 h-8 text-accent mb-4" />
                  <h3 className="text-white font-semibold mb-2">Professioneel</h3>
                  <p className="text-white/70 text-sm">Ondersteuning door ervaren professionals</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left">
                  <Heart className="w-8 h-8 text-accent mb-4" />
                  <h3 className="text-white font-semibold mb-2">Menselijk</h3>
                  <p className="text-white/70 text-sm">Jouw welzijn staat altijd centraal</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regional Partners Section */}
        {partners && partners.length > 0 && (
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Partners in {page.region || 'de Regio'}
                </h2>
                <p className="text-muted-foreground text-lg">
                  Bedrijven die zich inzetten voor een veiligere werkplek
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {partners.map((partner, index) => (
                  <Card 
                    key={partner.id} 
                    className="p-6 flex items-center justify-center border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card animate-scale-in h-24"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {partner.logo_url ? (
                      <img 
                        src={partner.logo_url} 
                        alt={partner.name}
                        className="max-h-12 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    ) : (
                      <span className="text-sm font-medium text-center text-muted-foreground">{partner.name}</span>
                    )}
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-10">
                <Link to="/onze-partners">
                  <Button variant="outline" size="lg" className="gap-2 hover:scale-105 transition-transform">
                    Bekijk alle partners <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 text-center relative">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate-slide-up">
                {page.cta_text || `Maak het verschil in ${page.region || 'de bouw'}`}
              </h2>
              
              <p className="text-xl text-white/90 mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Sluit je aan bij de beweging voor een veiligere en respectvollere bouwsector. 
                Samen maken we het verschil.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-7 bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl hover:shadow-accent/25 transition-all duration-300 hover:scale-105"
                  onClick={() => setShowMembershipForm(true)}
                >
                  Word lid
                </Button>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                    <Phone className="mr-2 w-5 h-5" />
                    Neem contact op
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <MembershipForm 
        open={showMembershipForm} 
        onOpenChange={setShowMembershipForm} 
      />
    </>
  );
};

export default LandingPage;
