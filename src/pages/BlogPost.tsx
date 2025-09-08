import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, Clock, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import StructuredData from "@/components/StructuredData";

const BlogPost = () => {
  const { slug } = useParams();

  const blogPosts = {
    "waarom-verlaten-jongeren-bouwsector": {
      id: 1,
      title: "Waarom verlaten jongeren de bouwsector? Een diepgaande analyse",
      content: `
        <p>De Nederlandse bouwsector kampt met een groeiend probleem: jong talent verlaat massaal de sector. Uit recent onderzoek blijkt dat maar liefst 40% van de jonge bouwvakkers binnen vijf jaar een andere carrière kiest.</p>
        
        <h2>De hoofdredenen voor vertrek</h2>
        
        <h3>1. Grensoverschrijdend gedrag op de werkplek</h3>
        <p>Intimidatie, pesten en grensoverschrijdend gedrag komen nog altijd veel te vaak voor op bouwplaatsen. Jongeren, en vooral vrouwen die de sector willen betreden, voelen zich niet veilig of geaccepteerd.</p>
        
        <h3>2. Gebrek aan doorgroeimogelijkheden</h3>
        <p>Veel jongeren zien geen duidelijk carrièrepad in de bouw. De traditionele hiërarchie en het gebrek aan moderne leiderschapsstijlen maken dat talent wegloopt naar andere sectoren.</p>
        
        <h3>3. Werkdruk en werk-privé balans</h3>
        <p>Lange werkdagen, fysiek zwaar werk en een cultuur waarin overwerk wordt verwacht, botst met de waarden van nieuwe generaties die werk-privé balans belangrijk vinden.</p>
        
        <h2>De oplossing: cultuurverandering van binnenuit</h2>
        
        <p>Bij Bouw met Respect geloven we dat verandering mogelijk is. Door samen te werken aan een respectvolle werkplek kunnen we de bouwsector aantrekkelijker maken voor jong talent.</p>
        
        <h3>Onze aanpak</h3>
        <ul>
          <li><strong>Bewustwording:</strong> Workshops over respectvol gedrag en inclusiviteit</li>
          <li><strong>Keurmerk:</strong> Bedrijven die zich inzetten krijgen erkenning</li>
          <li><strong>Coaching:</strong> Begeleiding bij cultuurverandering</li>
          <li><strong>Netwerk:</strong> Contact met gelijkgestemde professionals</li>
        </ul>
        
        <h2>De voordelen van een veilige werkplek</h2>
        
        <p>Bedrijven die investeren in een respectvolle werkplek zien direct resultaat:</p>
        <ul>
          <li>Minder ziekteverzuim</li>
          <li>Hogere productiviteit</li>
          <li>Betere reputatie</li>
          <li>Aantrekken van diverse talenten</li>
        </ul>
        
        <p><strong>Samen kunnen we de Nederlandse bouwsector transformeren naar een industrie waar iedereen zich welkom en veilig voelt.</strong></p>
      `,
      author: "Bouw met Respect Team",
      date: "8 januari 2025",
      readTime: "5 min leestijd",
      category: "Jong Talent",
      image: "/lovable-uploads/6a653db4-1d30-46c2-83c1-760e5459fb7d.png"
    },
    "succesverhalen-cultuurverandering-bouw": {
      id: 2,
      title: "Succesverhalen: Cultuurverandering in de praktijk",
      content: `
        <p>Cultuurverandering in de bouwsector is geen utopie. Steeds meer bedrijven tonen aan dat een respectvolle werkplek niet alleen mogelijk is, maar ook lonend.</p>
        
        <h2>Bouwbedrijf Van der Berg: Van macho naar modern</h2>
        
        <p>Drie jaar geleden kampte bouwbedrijf Van der Berg met een hoog verloop onder jong talent. Na het implementeren van een zero-tolerance beleid tegen grensoverschrijdend gedrag en het invoeren van mentorprogramma's, zag het bedrijf een omslag.</p>
        
        <blockquote>
          "We zijn van 60% verloop naar 15% gegaan in twee jaar tijd. Onze jonge werknemers voelen zich nu gehoord en gerespecteerd."
          <cite>- Sandra van der Berg, eigenaar</cite>
        </blockquote>
        
        <h3>Wat hebben ze gedaan?</h3>
        <ul>
          <li>Verplichte training over respectvol gedrag voor alle medewerkers</li>
          <li>Mentorprogramma voor nieuwe werknemers</li>
          <li>Anonieme meldlijn voor incidenten</li>
          <li>Regelmatige evaluaties van de werksfeer</li>
        </ul>
        
        <h2>Aannemersbedrijf Jansen: Diversiteit als kracht</h2>
        
        <p>Dit bedrijf zette bewust in op het aantrekken van vrouwelijke werknemers en werknemers met een migrantieachtergrond.</p>
        
        <blockquote>
          "Diversiteit heeft ons team sterker gemaakt. We hebben nu verschillende perspectieven en dat resulteert in betere oplossingen."
          <cite>- Marc Jansen, projectleider</cite>
        </blockquote>
        
        <h3>Hun succesformule:</h3>
        <ul>
          <li>Gerichte werving bij diverse groepen</li>
          <li>Aangepaste kleedkamers en faciliteiten</li>
          <li>Cultuurtraining voor alle teams</li>
          <li>Flexibele werktijden waar mogelijk</li>
        </ul>
        
        <h2>De resultaten spreken voor zich</h2>
        
        <p>Bedrijven die investeren in cultuurverandering zien concrete voordelen:</p>
        
        <h3>Financiële voordelen</h3>
        <ul>
          <li>25% minder ziekteverzuim</li>
          <li>30% minder personeelsverloop</li>
          <li>15% hogere productiviteit</li>
          <li>Lagere wervingskosten</li>
        </ul>
        
        <h3>Sociale voordelen</h3>
        <ul>
          <li>Betere teamsamenhang</li>
          <li>Hogere werknemerstevredenheid</li>
          <li>Positieve reputatie in de sector</li>
          <li>Aantrekkelijkheid voor jong talent</li>
        </ul>
        
        <p><strong>Deze verhalen tonen aan dat cultuurverandering in de bouw niet alleen wenselijk is, maar ook haalbaar en lonend.</strong></p>
      `,
      author: "Sandra van der Berg",
      date: "5 januari 2025",
      readTime: "7 min leestijd",
      category: "Cultuurverandering",
      image: "/lovable-uploads/a1441b5c-4e80-4aa5-9535-e2d1a585a97d.png"
    }
  };

  const post = blogPosts[slug as keyof typeof blogPosts];

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "datePublished": "2025-01-08",
    "dateModified": "2025-01-08",
    "description": post.content.substring(0, 160),
    "image": `https://bouwmetrespect.nl${post.image}`,
    "publisher": {
      "@type": "Organization",
      "name": "Bouw met Respect",
      "url": "https://bouwmetrespect.nl"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://bouwmetrespect.nl/blog/${slug}`
    },
    "keywords": "bouwsector veiligheid, jong talent bouw, cultuurverandering, grensoverschrijdend gedrag, respectvolle werkplek"
  };

  return (
    <>
      <StructuredData type="article" data={structuredData} />
      <article className="min-h-screen pt-24">
        {/* Header */}
        <header className="py-16 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar blog
              </Link>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                {post.title}
              </h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Door {post.author}</span>
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Deel artikel
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div 
                className="prose prose-lg max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              {/* Call to Action */}
              <Card className="mt-12 p-8 bg-primary/5 border-primary/20">
                <CardHeader className="text-center pb-4">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Sluit je aan bij de beweging
                  </h2>
                  <p className="text-muted-foreground">
                    Help mee aan een veiligere en respectvollere bouwsector voor iedereen.
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <Button size="lg" className="mr-4">
                    Word lid van onze community
                  </Button>
                  <Button variant="outline" size="lg">
                    Lees meer verhalen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </article>
    </>
  );
};

export default BlogPost;