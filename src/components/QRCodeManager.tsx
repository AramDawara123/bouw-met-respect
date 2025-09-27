import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Download, Copy, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface QRCodeItem {
  id: string;
  title: string;
  content: string;
  qr_size: number;
  error_correction: string;
  created_at: string;
  updated_at: string;
}

const QRCodeManager = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState<QRCodeItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [viewingCode, setViewingCode] = useState<QRCodeItem | null>(null);
  const [generatedQRImage, setGeneratedQRImage] = useState<string>("");

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching QR codes:", error);
        toast.error("Fout bij het ophalen van QR codes");
        return;
      }

      setQrCodes(data || []);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      toast.error("Fout bij het ophalen van QR codes");
    } finally {
      setLoading(false);
    }
  };

  const deleteQRCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting QR code:", error);
        toast.error("Fout bij het verwijderen van QR code");
        return;
      }

      setQrCodes(qrCodes.filter(code => code.id !== id));
      toast.success("QR code verwijderd!");
    } catch (error) {
      console.error("Error deleting QR code:", error);
      toast.error("Fout bij het verwijderen van QR code");
    }
  };

  const updateQRCode = async () => {
    if (!editingCode || !editTitle.trim() || !editContent.trim()) {
      toast.error("Titel en inhoud zijn verplicht");
      return;
    }

    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({
          title: editTitle.trim(),
          content: editContent.trim(),
        })
        .eq('id', editingCode.id);

      if (error) {
        console.error("Error updating QR code:", error);
        toast.error("Fout bij het bijwerken van QR code");
        return;
      }

      setQrCodes(qrCodes.map(code => 
        code.id === editingCode.id 
          ? { ...code, title: editTitle.trim(), content: editContent.trim() }
          : code
      ));
      
      setEditingCode(null);
      setEditTitle("");
      setEditContent("");
      toast.success("QR code bijgewerkt!");
    } catch (error) {
      console.error("Error updating QR code:", error);
      toast.error("Fout bij het bijwerken van QR code");
    }
  };

  const generateQRImage = async (qrCodeItem: QRCodeItem) => {
    try {
      const dataUrl = await QRCode.toDataURL(qrCodeItem.content, {
        width: qrCodeItem.qr_size,
        errorCorrectionLevel: qrCodeItem.error_correction as 'L' | 'M' | 'Q' | 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return dataUrl;
    } catch (error) {
      console.error("Error generating QR image:", error);
      return "";
    }
  };

  const viewQRCode = async (qrCodeItem: QRCodeItem) => {
    setViewingCode(qrCodeItem);
    const image = await generateQRImage(qrCodeItem);
    setGeneratedQRImage(image);
  };

  const downloadQRCode = async (qrCodeItem: QRCodeItem) => {
    const image = await generateQRImage(qrCodeItem);
    if (image) {
      const link = document.createElement('a');
      link.download = `${qrCodeItem.title}.png`;
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code gedownload!");
    }
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Inhoud gekopieerd!");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Laden...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Opgeslagen QR Codes</CardTitle>
          <CardDescription>
            Beheer je opgeslagen QR codes - bekijk, bewerk, download of verwijder ze.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {qrCodes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Geen QR codes gevonden.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Maak je eerste QR code aan met de QR Generator hierboven.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {qrCodes.map((qrCode) => (
                <div key={qrCode.id} className="border border-accent rounded-lg p-4 space-y-3 bg-accent/5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-medium">{qrCode.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {qrCode.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Aangemaakt: {format(new Date(qrCode.created_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewQRCode(qrCode)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadQRCode(qrCode)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyContent(qrCode.content)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCode(qrCode);
                              setEditTitle(qrCode.title);
                              setEditContent(qrCode.content);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>QR Code Bewerken</DialogTitle>
                            <DialogDescription>
                              Pas de titel en inhoud van je QR code aan.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-title">Titel</Label>
                              <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                maxLength={100}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-content">Inhoud</Label>
                              <Input
                                id="edit-content"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                maxLength={2000}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingCode(null);
                                setEditTitle("");
                                setEditContent("");
                              }}
                            >
                              Annuleren
                            </Button>
                            <Button onClick={updateQRCode}>
                              Opslaan
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>QR Code Verwijderen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Weet je zeker dat je "{qrCode.title}" wilt verwijderen? Deze actie kan niet ongedaan gemaakt worden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteQRCode(qrCode.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Verwijderen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View QR Code Dialog */}
      <Dialog open={viewingCode !== null} onOpenChange={() => setViewingCode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewingCode?.title}</DialogTitle>
            <DialogDescription>
              {viewingCode?.content}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {generatedQRImage && (
              <img 
                src={generatedQRImage} 
                alt={`QR Code voor ${viewingCode?.title}`}
                className="border border-accent rounded-lg bg-accent/5"
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => viewingCode && downloadQRCode(viewingCode)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={() => setViewingCode(null)}>
              Sluiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRCodeManager;