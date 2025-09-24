import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, QrCode, Copy } from "lucide-react";
import QRCode from "qrcode";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const qrSchema = z.object({
  text: z.string().trim().min(1, "Tekst mag niet leeg zijn").max(2000, "Tekst mag maximaal 2000 karakters bevatten"),
  size: z.enum(["small", "medium", "large"]),
  errorCorrectionLevel: z.enum(["L", "M", "Q", "H"])
});

export const QRCodeGenerator = () => {
  const [text, setText] = useState("");
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const sizeMap = {
    small: 200,
    medium: 300,
    large: 400
  };

  const generateQRCode = async () => {
    console.log('🔄 Starting QR code generation...');
    console.log('📝 Text input:', text);
    console.log('📏 Size:', size, sizeMap[size]);
    console.log('⚙️ Error level:', errorLevel);
    
    try {
      const validation = qrSchema.safeParse({
        text: text,
        size: size,
        errorCorrectionLevel: errorLevel
      });

      if (!validation.success) {
        console.error('❌ Validation failed:', validation.error.errors);
        toast({
          title: "Invoer fout",
          description: validation.error.errors[0].message,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Validation passed');
      setIsGenerating(true);
      
      const canvas = canvasRef.current;
      console.log('🖼️ Canvas element:', canvas);
      
      if (!canvas) {
        console.error('❌ No canvas element found');
        toast({
          title: "Canvas Fout",
          description: "Canvas element niet gevonden",
          variant: "destructive"
        });
        return;
      }

      console.log('📐 Generating QR code with options:', {
        width: sizeMap[size],
        margin: 2,
        errorCorrectionLevel: errorLevel
      });

      await QRCode.toCanvas(canvas, text, {
        width: sizeMap[size],
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: errorLevel
      });

      console.log('✅ QR code generated on canvas');

      // Convert canvas to data URL for download
      const dataUrl = canvas.toDataURL('image/png');
      console.log('🖼️ Data URL generated:', dataUrl.substring(0, 50) + '...');
      setQrCodeUrl(dataUrl);
      
      toast({
        title: "QR Code Gegenereerd",
        description: "Je QR code is succesvol aangemaakt!"
      });
    } catch (error) {
      console.error('💥 Error generating QR code:', error);
      toast({
        title: "Fout",
        description: `Er ging iets mis: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
    
    toast({
      title: "Download Gestart",
      description: "Je QR code wordt gedownload"
    });
  };

  const copyToClipboard = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast({
        title: "Gekopieerd",
        description: "QR code is gekopieerd naar het klembord"
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Kopiëren mislukt",
        description: "Kon QR code niet kopiëren. Probeer downloaden.",
        variant: "destructive"
      });
    }
  };

  const clearForm = () => {
    setText("");
    setQrCodeUrl("");
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Generator
          </CardTitle>
          <CardDescription>
            Genereer QR codes voor URLs, tekst, contactgegevens en meer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-text">Tekst of URL</Label>
            <Textarea
              id="qr-text"
              placeholder="Voer hier je tekst of URL in..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px]"
              maxLength={2000}
            />
            <p className="text-sm text-muted-foreground">
              {text.length}/2000 karakters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grootte</Label>
              <Select value={size} onValueChange={(value: "small" | "medium" | "large") => setSize(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Klein (200x200)</SelectItem>
                  <SelectItem value="medium">Middel (300x300)</SelectItem>
                  <SelectItem value="large">Groot (400x400)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Foutcorrectie</Label>
              <Select value={errorLevel} onValueChange={(value: "L" | "M" | "Q" | "H") => setErrorLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laag (~7%)</SelectItem>
                  <SelectItem value="M">Middel (~15%)</SelectItem>
                  <SelectItem value="Q">Hoog (~25%)</SelectItem>
                  <SelectItem value="H">Zeer hoog (~30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateQRCode} 
              disabled={!text.trim() || isGenerating}
              className="flex-1"
            >
              {isGenerating ? "Genereren..." : "Genereer QR Code"}
            </Button>
            <Button 
              variant="outline" 
              onClick={clearForm}
            >
              Wissen
            </Button>
          </div>

          {/* Hidden canvas for QR generation */}
          <canvas 
            ref={canvasRef}
            style={{ display: 'none' }}
          />
        </CardContent>
      </Card>

      {qrCodeUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Je QR Code</CardTitle>
            <CardDescription>
              Klik met rechtermuisknop om op te slaan, of gebruik de knoppen hieronder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="border rounded-lg shadow-sm p-4">
                <img 
                  src={qrCodeUrl}
                  alt="Generated QR Code"
                  className="max-w-full h-auto"
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button onClick={downloadQRCode} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button 
                variant="outline" 
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Kopiëren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};