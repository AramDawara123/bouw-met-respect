import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Eye, Palette, Type, Layout, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useWebsiteContent } from '@/hooks/useWebsiteContent';

const WebsiteEditor = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("content");
  const { content, loading, saveContent } = useWebsiteContent();
  const [editedContent, setEditedContent] = useState(content);
  const [saving, setSaving] = useState(false);

  // Update editedContent when content changes
  React.useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveContent(editedContent);
      if (success) {
        toast.success("Website content succesvol opgeslagen!");
      } else {
        toast.error("Er is een fout opgetreden bij het opslaan.");
      }
    } catch (error) {
      toast.error("Er is een fout opgetreden bij het opslaan.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Open the main site in a new tab to see changes
    window.open('/', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Website content laden...</span>
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
            <h1 className="text-xl font-semibold">Website Content Editor</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Bekijk Website
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Content Bewerken
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Kleuren & Stijl
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Sectie (Hoofdpagina)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero-title" className="text-sm font-medium">Hoofdtitel</Label>
                  <Input
                    id="hero-title"
                    value={editedContent.hero_title}
                    onChange={(e) => setEditedContent(prev => ({...prev, hero_title: e.target.value}))}
                    className="mt-2"
                    placeholder="Hoofdtitel van de website"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-subtitle" className="text-sm font-medium">Ondertitel</Label>
                  <Textarea
                    id="hero-subtitle"
                    value={editedContent.hero_subtitle}
                    onChange={(e) => setEditedContent(prev => ({...prev, hero_subtitle: e.target.value}))}
                    className="mt-2"
                    rows={3}
                    placeholder="Beschrijving onder de hoofdtitel"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Missie Sectie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mission-title" className="text-sm font-medium">Sectie Titel</Label>
                  <Input
                    id="mission-title"
                    value={editedContent.mission_title}
                    onChange={(e) => setEditedContent(prev => ({...prev, mission_title: e.target.value}))}
                    className="mt-2"
                    placeholder="Titel van de missie sectie"
                  />
                </div>
                <div>
                  <Label htmlFor="mission-text" className="text-sm font-medium">Missie Tekst</Label>
                  <Textarea
                    id="mission-text"
                    value={editedContent.mission_text}
                    onChange={(e) => setEditedContent(prev => ({...prev, mission_text: e.target.value}))}
                    className="mt-2"
                    rows={4}
                    placeholder="Beschrijving van jullie missie en doelen"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Gegevens</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="contact-email" className="text-sm font-medium">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={editedContent.contact_email}
                    onChange={(e) => setEditedContent(prev => ({...prev, contact_email: e.target.value}))}
                    className="mt-2"
                    placeholder="Email adres voor contact"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="design" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Website Kleuren</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="primary-color" className="text-sm font-medium">Primaire Kleur</Label>
                  <p className="text-xs text-gray-600 mb-2">Hoofdkleur voor knoppen, accenten en branding</p>
                  <div className="flex gap-3 items-center">
                    <input
                      id="primary-color"
                      type="color"
                      value={editedContent.primary_color}
                      onChange={(e) => setEditedContent(prev => ({...prev, primary_color: e.target.value}))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={editedContent.primary_color}
                      onChange={(e) => setEditedContent(prev => ({...prev, primary_color: e.target.value}))}
                      className="flex-1"
                      placeholder="#8B5CF6"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondary-color" className="text-sm font-medium">Secundaire Kleur</Label>
                  <p className="text-xs text-gray-600 mb-2">Tweede kleur voor highlights en variatie</p>
                  <div className="flex gap-3 items-center">
                    <input
                      id="secondary-color"
                      type="color"
                      value={editedContent.secondary_color}
                      onChange={(e) => setEditedContent(prev => ({...prev, secondary_color: e.target.value}))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={editedContent.secondary_color}
                      onChange={(e) => setEditedContent(prev => ({...prev, secondary_color: e.target.value}))}
                      className="flex-1"
                      placeholder="#10B981"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Voorvertoning Kleuren</h4>
                  <div className="flex gap-3">
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: editedContent.primary_color }}
                    >
                      Primair
                    </div>
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: editedContent.secondary_color }}
                    >
                      Secundair
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WebsiteEditor;