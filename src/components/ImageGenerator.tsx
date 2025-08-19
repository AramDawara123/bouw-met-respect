
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Download } from "lucide-react";
import { RunwareService } from "@/services/RunwareService";
import { toast } from "sonner";

interface ImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
  defaultPrompt?: string;
  className?: string;
}

const ImageGenerator = ({ onImageGenerated, defaultPrompt = "", className = "" }: ImageGeneratorProps) => {
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async () => {
    if (!apiKey.trim()) {
      toast.error("Voer je Runware API key in");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Voer een prompt in");
      return;
    }

    setIsGenerating(true);

    try {
      const service = new RunwareService(apiKey);
      const result = await service.generateImage({
        positivePrompt: prompt,
        model: "runware:100@1",
        width: 1024,
        height: 1024,
        numberResults: 1,
        outputFormat: "WEBP",
      });

      setGeneratedImage(result.imageURL);
      if (onImageGenerated) {
        onImageGenerated(result.imageURL);
      }
      toast.success("Afbeelding succesvol gegenereerd!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Er ging iets mis bij het genereren van de afbeelding");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bouw-met-respect-${Date.now()}.webp`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Download mislukt");
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Runware API Key
          </label>
          <Input
            type="password"
            placeholder="Voer je Runware API key in..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Krijg je API key van{" "}
            <a
              href="https://runware.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              runware.ai
            </a>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Afbeelding Prompt
          </label>
          <Input
            placeholder="Beschrijf de gewenste afbeelding..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <Button
          onClick={generateImage}
          disabled={isGenerating || !apiKey.trim() || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Genereren...
            </>
          ) : (
            "Genereer Afbeelding"
          )}
        </Button>

        {generatedImage && (
          <div className="space-y-4">
            <img
              src={generatedImage}
              alt="Gegenereerde afbeelding"
              className="w-full h-auto rounded-lg"
            />
            <Button
              onClick={downloadImage}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Afbeelding
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImageGenerator;
