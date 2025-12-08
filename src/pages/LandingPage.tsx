import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Building2, Phone, ArrowRight, CheckCircle, MapPin } from 'lucide-react';
import MembershipForm from '@/components/MembershipForm';
import { useState } from 'react';
import Footer from '@/components/Footer';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Pagina niet gevonden</h1>
        <Link to="/">
          <Button>Terug naar home</Button>
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

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {page.region && (
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Regio {page.region}</span>
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {page.h1_title}
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                {page.intro_text}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => setShowMembershipForm(true)}
                >
                  Sluit je aan <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Link to="/partner">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Word partner
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        {page.statistics && Object.keys(page.statistics).length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(page.statistics).map(([key, value]) => (
                  <Card key={key} className="text-center">
                    <CardContent className="pt-6">
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        {String(value)}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Content Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div 
                className="prose prose-lg max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: page.main_content }}
              />
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        {page.solutions_text && (
          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                  Onze Oplossingen voor {page.region || 'Uw Regio'}
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <Card className="text-center p-6">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Preventie & Training</h3>
                    <p className="text-sm text-muted-foreground">
                      Voorkom grensoverschrijdend gedrag met onze trainingen en bewustwordingsprogramma's.
                    </p>
                  </Card>
                  
                  <Card className="text-center p-6">
                    <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Netwerk & Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Verbind met gelijkgestemde professionals die respect voorop stellen.
                    </p>
                  </Card>
                  
                  <Card className="text-center p-6">
                    <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Certificering</h3>
                    <p className="text-sm text-muted-foreground">
                      Toon aan dat uw bedrijf zich inzet voor een veilige werkomgeving.
                    </p>
                  </Card>
                </div>

                <div 
                  className="prose prose-lg max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: page.solutions_text }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Regional Partners Section */}
        {partners && partners.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                Partners in {page.region || 'de Regio'}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {partners.map((partner) => (
                  <Card key={partner.id} className="p-4 flex items-center justify-center">
                    {partner.logo_url ? (
                      <img 
                        src={partner.logo_url} 
                        alt={partner.name}
                        className="max-h-16 object-contain"
                      />
                    ) : (
                      <span className="text-sm font-medium text-center">{partner.name}</span>
                    )}
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Link to="/onze-partners">
                  <Button variant="outline">
                    Bekijk alle partners <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {page.cta_text || `Maak het verschil in ${page.region || 'de bouw'}`}
            </h2>
            
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Sluit je aan bij de beweging voor een veiligere en respectvollere bouwsector.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8"
                onClick={() => setShowMembershipForm(true)}
              >
                Word lid
              </Button>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Phone className="mr-2 w-5 h-5" />
                  Neem contact op
                </Button>
              </Link>
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
