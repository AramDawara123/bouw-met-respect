import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Eye, Palette, Type, Image, Layout } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const WebsiteEditor = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("content");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Content state
  const [content, setContent] = useState({
    heroTitle: "Bouw met Respect",
    heroSubtitle: "Samen bouwen we aan een betere toekomst voor de bouwsector",
    missionTitle: "Onze Missie",
    missionText: "Een werkplek waar respect, veiligheid en inclusie centraal staan.",
    contactEmail: "info@bouwmetrespect.nl"
  });

  // Style state
  const [styles, setStyles] = useState({
    primaryColor: "#8B5CF6",
    secondaryColor: "#10B981", 
    fontFamily: "Inter",
    backgroundColor: "#FFFFFF"
  });

  const handleContentSave = () => {
    // Save to localStorage for demo purposes
    localStorage.setItem('websiteContent', JSON.stringify(content));
    localStorage.setItem('websiteStyles', JSON.stringify(styles));
    toast.success("Website wijzigingen opgeslagen!");
  };

  const handlePreviewToggle = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  useEffect(() => {
    // Load saved content on mount
    const savedContent = localStorage.getItem('websiteContent');
    const savedStyles = localStorage.getItem('websiteStyles');
    
    if (savedContent) {
      setContent(JSON.parse(savedContent));
    }
    if (savedStyles) {
      setStyles(JSON.parse(savedStyles));
    }
  }, []);

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-background">
        {/* Preview Header */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Editor
            </Button>
            <span className="text-sm">Live Voorvertoning</span>
          </div>
          <Button onClick={handleContentSave} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Publiceren
          </Button>
        </div>

        {/* Live Preview */}
        <div 
          className="min-h-screen" 
          style={{ 
            fontFamily: styles.fontFamily,
            backgroundColor: styles.backgroundColor 
          }}
        >
          {/* Hero Section Preview */}
          <section className="py-20 px-4 text-center" style={{ color: styles.primaryColor }}>
            <h1 className="text-5xl font-bold mb-4">{content.heroTitle}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{content.heroSubtitle}</p>
          </section>

          {/* Mission Section Preview */}
          <section className="py-16 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6" style={{ color: styles.primaryColor }}>
                {content.missionTitle}
              </h2>
              <p className="text-lg text-gray-700">{content.missionText}</p>
            </div>
          </section>

          {/* Contact Preview */}
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6" style={{ color: styles.primaryColor }}>
                Neem Contact Op
              </h2>
              <p className="text-lg">
                Email: <span style={{ color: styles.secondaryColor }}>{content.contactEmail}</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Editor Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Dashboard
            </Button>
            <h1 className="text-xl font-semibold">Website Editor</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePreviewToggle}>
              <Eye className="w-4 h-4 mr-2" />
              Voorvertoning
            </Button>
            <Button onClick={handleContentSave}>
              <Save className="w-4 h-4 mr-2" />
              Opslaan
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Editor Panel */}
        <div className="w-96 bg-white border-r overflow-y-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content" className="text-xs">
                  <Type className="w-4 h-4 mr-1" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="design" className="text-xs">
                  <Palette className="w-4 h-4 mr-1" />
                  Design
                </TabsTrigger>
                <TabsTrigger value="layout" className="text-xs">
                  <Layout className="w-4 h-4 mr-1" />
                  Layout
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Hero Sectie</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="hero-title" className="text-sm">Hoofdtitel</Label>
                      <Input
                        id="hero-title"
                        value={content.heroTitle}
                        onChange={(e) => setContent(prev => ({...prev, heroTitle: e.target.value}))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-subtitle" className="text-sm">Ondertitel</Label>
                      <Textarea
                        id="hero-subtitle"
                        value={content.heroSubtitle}
                        onChange={(e) => setContent(prev => ({...prev, heroSubtitle: e.target.value}))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Missie Sectie</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="mission-title" className="text-sm">Titel</Label>
                      <Input
                        id="mission-title"
                        value={content.missionTitle}
                        onChange={(e) => setContent(prev => ({...prev, missionTitle: e.target.value}))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mission-text" className="text-sm">Tekst</Label>
                      <Textarea
                        id="mission-text"
                        value={content.missionText}
                        onChange={(e) => setContent(prev => ({...prev, missionText: e.target.value}))}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="contact-email" className="text-sm">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={content.contactEmail}
                        onChange={(e) => setContent(prev => ({...prev, contactEmail: e.target.value}))}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="design" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Kleuren</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primary-color" className="text-sm">Primaire Kleur</Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          id="primary-color"
                          type="color"
                          value={styles.primaryColor}
                          onChange={(e) => setStyles(prev => ({...prev, primaryColor: e.target.value}))}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={styles.primaryColor}
                          onChange={(e) => setStyles(prev => ({...prev, primaryColor: e.target.value}))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondary-color" className="text-sm">Secundaire Kleur</Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          id="secondary-color"
                          type="color"
                          value={styles.secondaryColor}
                          onChange={(e) => setStyles(prev => ({...prev, secondaryColor: e.target.value}))}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={styles.secondaryColor}
                          onChange={(e) => setStyles(prev => ({...prev, secondaryColor: e.target.value}))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bg-color" className="text-sm">Achtergrond</Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          id="bg-color"
                          type="color"
                          value={styles.backgroundColor}
                          onChange={(e) => setStyles(prev => ({...prev, backgroundColor: e.target.value}))}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={styles.backgroundColor}
                          onChange={(e) => setStyles(prev => ({...prev, backgroundColor: e.target.value}))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="layout" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Layout Instellingen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Layout aanpassingen komen binnenkort beschikbaar.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="flex-1 bg-white">
          <div className="h-full overflow-auto">
            <div className="p-8" style={{ fontFamily: styles.fontFamily }}>
              {/* Preview Content */}
              <div className="max-w-4xl mx-auto space-y-16">
                {/* Hero Preview */}
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="mb-2 text-xs text-gray-500 uppercase tracking-wide">Hero Sectie</div>
                  <h1 
                    className="text-4xl font-bold mb-4"
                    style={{ color: styles.primaryColor }}
                  >
                    {content.heroTitle}
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {content.heroSubtitle}
                  </p>
                </div>

                {/* Mission Preview */}
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <div className="mb-2 text-xs text-gray-500 uppercase tracking-wide">Missie Sectie</div>
                  <h2 
                    className="text-3xl font-bold mb-6"
                    style={{ color: styles.primaryColor }}
                  >
                    {content.missionTitle}
                  </h2>
                  <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                    {content.missionText}
                  </p>
                </div>

                {/* Contact Preview */}
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="mb-2 text-xs text-gray-500 uppercase tracking-wide">Contact Sectie</div>
                  <h2 
                    className="text-3xl font-bold mb-6"
                    style={{ color: styles.primaryColor }}
                  >
                    Neem Contact Op
                  </h2>
                  <p className="text-lg">
                    Email: <span style={{ color: styles.secondaryColor }}>{content.contactEmail}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteEditor;