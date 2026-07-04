import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Upload, Lock, Loader2 } from "lucide-react";
import { getInterviewPhotoDisplayUrl, getInterviewPhotoStoragePath } from "@/lib/interviewPhotos";

interface Interview {
  id: string;
  position: number;
  name: string;
  role: string;
  intro: string;
  full_interview: string;
  image_url: string;
  display_image_url?: string;
  is_locked: boolean;
}

const empty = (position: number): Interview => ({
  id: "",
  position,
  name: "",
  role: "",
  intro: "",
  full_interview: "",
  image_url: "",
  is_locked: false,
});

const InterviewsManager = () => {
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Interview | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("home_interviews" as any)
      .select("*")
      .order("position", { ascending: true });
    if (error) {
      toast({ title: "Fout bij laden", description: error.message, variant: "destructive" });
    } else {
      const rows = (data as unknown as Interview[]) || [];
      const withPhotos = await Promise.all(
        rows.map(async (interview) => ({
          ...interview,
          display_image_url: await getInterviewPhotoDisplayUrl(interview.image_url),
        }))
      );
      setInterviews(withPhotos);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("interview-photos")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const displayUrl = await getInterviewPhotoDisplayUrl(path);
      setEditing({ ...editing, image_url: path, display_image_url: displayUrl });
      toast({ title: "Foto geüpload" });
    } catch (e: any) {
      toast({ title: "Upload mislukt", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast({ title: "Naam is verplicht", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        const { error } = await supabase
          .from("home_interviews" as any)
          .update({
            position: editing.position,
            name: editing.name,
            role: editing.role,
            intro: editing.intro,
            full_interview: editing.full_interview,
            image_url: getInterviewPhotoStoragePath(editing.image_url) || editing.image_url,
          })
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const nextPos = (interviews.at(-1)?.position ?? 0) + 1;
        const { error } = await supabase.from("home_interviews" as any).insert({
          position: editing.position || nextPos,
          name: editing.name,
          role: editing.role,
          intro: editing.intro,
          full_interview: editing.full_interview,
          image_url: getInterviewPhotoStoragePath(editing.image_url) || editing.image_url,
          is_locked: false,
        });
        if (error) throw error;
      }
      toast({ title: "Opgeslagen" });
      setEditing(null);
      load();
    } catch (e: any) {
      toast({ title: "Opslaan mislukt", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Interview) => {
    if (item.is_locked) {
      toast({ title: "Vergrendeld", description: "De bestuurder kan niet verwijderd worden.", variant: "destructive" });
      return;
    }
    if (!confirm(`Verwijder "${item.name}"?`)) return;
    const { error } = await supabase.from("home_interviews" as any).delete().eq("id", item.id);
    if (error) {
      toast({ title: "Verwijderen mislukt", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Verwijderd" });
      load();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Interviews (homepage)</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Beheer foto's en interviews die op de homepage verschijnen. De bestuurder staat altijd op positie 1.
            </p>
          </div>
          <Button onClick={() => setEditing(empty((interviews.at(-1)?.position ?? 0) + 1))}>
            <Plus className="w-4 h-4 mr-2" /> Nieuw interview
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">Laden…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviews.map((it) => (
                <Card key={it.id} className="overflow-hidden">
                  <div className="aspect-[16/10] bg-muted">
                    {it.image_url ? (
                      <img src={it.display_image_url || it.image_url} alt={it.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        Geen foto
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{it.position}</Badge>
                      {it.is_locked && (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="w-3 h-3" /> Vast
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold">{it.name}</h4>
                    <p className="text-xs text-muted-foreground">{it.role}</p>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(it)}>
                        <Edit className="w-3 h-3 mr-1" /> Bewerk
                      </Button>
                      {!it.is_locked && (
                        <Button size="sm" variant="outline" onClick={() => handleDelete(it)}>
                          <Trash2 className="w-3 h-3 mr-1" /> Verwijder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Interview bewerken" : "Nieuw interview"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Foto</Label>
                {(editing.display_image_url || editing.image_url) && (
                  <img
                    src={editing.display_image_url || editing.image_url}
                    alt=""
                    className="w-full max-h-64 object-contain rounded border"
                  />
                )}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f);
                    }}
                  />
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Positie</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editing.position}
                    disabled={editing.is_locked}
                    onChange={(e) => setEditing({ ...editing, position: parseInt(e.target.value) || 1 })}
                  />
                  {editing.is_locked && (
                    <p className="text-xs text-muted-foreground">Bestuurder blijft op positie 1.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Naam *</Label>
                  <Input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rol / functie</Label>
                <Input
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Korte intro</Label>
                <Textarea
                  rows={2}
                  value={editing.intro}
                  onChange={(e) => setEditing({ ...editing, intro: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Volledig interview</Label>
                <Textarea
                  rows={10}
                  value={editing.full_interview}
                  onChange={(e) => setEditing({ ...editing, full_interview: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuleer</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewsManager;
