import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import StructuredData from "@/components/StructuredData";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Waarom verlaten jongeren de bouwsector? Een diepgaande analyse",
      excerpt: "Onderzoek naar de redenen waarom jong talent de bouwsector verlaat en hoe we dit kunnen omkeren door een veiligere en respectvollere werkplek te creëren.",
      author: "Bouw met Respect Team",
      date: "8 januari 2025",
      readTime: "5 min leestijd",
      category: "Jong Talent",
      slug: "waarom-verlaten-jongeren-bouwsector",
      image: "/lovable-uploads/6a653db4-1d30-46c2-83c1-760e5459fb7d.png"
    },
    {
      id: 2,
      title: "Succesverhalen: Cultuurverandering in de praktijk",
      excerpt: "Inspirerende verhalen van bouwbedrijven die succesvol hebben gewerkt aan een veiligere werkplek en de positieve impact daarvan op hun teams.",
      author: "Sandra van der Berg", 
      date: "5 januari 2025",
      readTime: "7 min leestijd",
      category: "Cultuurverandering",
      slug: "succesverhalen-cultuurverandering-bouw",
      image: "/lovable-uploads/a1441b5c-4e80-4aa5-9535-e2d1a585a97d.png"
    },
    {
      id: 3,
      title: "Praktische tips voor een veiligere bouwplaats",
      excerpt: "Concrete maatregelen en best practices die projectleiders en werkvoorbereiders kunnen implementeren voor een respectvollere werkomgeving.",
      author: "Marc Janssen",
      date: "3 januari 2025", 
      readTime: "6 min leestijd",
      category: "Werkplekveiligheid",
      slug: "tips-veiligere-bouwplaats",
      image: "/lovable-uploads/2a13d9d8-47a2-4787-9cba-80dfe398fd9e.png"
    },
    {
      id: 4,
      title: "Vrouwen in de bouw: Uitdagingen en kansen",
      excerpt: "Een interview met vrouwelijke professionals over hun ervaringen in de bouwsector en hoe we meer diversiteit kunnen bevorderen.",
      author: "Lisa de Vries",
      date: "1 januari 2025",
      readTime: "8 min leestijd", 
      category: "Diversiteit",
      slug: "vrouwen-in-de-bouw-uitdagingen-kansen",
      image: "/lovable-uploads/b490bd1a-4422-4f83-8394-d7a2f6d940b9.png"
    }
  ];

  const categories = ["Alle artikelen", "Jong Talent", "Cultuurverandering", "Werkplekveiligheid", "Diversiteit"];

  return (
    <>
      <StructuredData type="organization" />
      <div className="min-h-screen pt-24">
        {/* Header Section */}
        <section className="py-16 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                Bouw met Respect Blog
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Inzichten, verhalen en praktische tips voor een veiligere en respectvollere bouwsector in Nederland.
              </p>
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={category === "Alle artikelen" ? "default" : "outline"}
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <article key={post.id}>
                    <Link to={`/blog/${post.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                              {post.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.readTime}
                            </div>
                          </div>
                          <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                            {post.title}
                          </h2>
                          <p className="text-muted-foreground mb-4">
                            {post.excerpt}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {post.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {post.date}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="group/btn">
                              Lees meer
                              <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Blijf op de hoogte van onze laatste artikelen
              </h2>
              <p className="mb-8 opacity-90">
                Ontvang wekelijks de nieuwste inzichten over veiligheid en respect in de bouwsector.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="je@email.nl"
                  className="flex-1 px-4 py-2 rounded-lg text-foreground"
                />
                <Button variant="secondary">
                  Aanmelden
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Blog;