import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { FileVideo, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useMemo, useState } from "react";

export function VideoImputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);

  function handleFileSelected({
    currentTarget,
  }: React.ChangeEvent<HTMLInputElement>) {
    const { files } = currentTarget;

    if (!files) {
      return;
    }

    const selectedFile = files[0];

    setVideoFile(selectedFile);
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null;
    }

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  return (
    <form className="space-y-6">
      <Label
        htmlFor="video"
        className="relative flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-primary/5"
      >
        {previewURL ? (
          <video
            src={previewURL}
            controls={false}
            className="pointer-events-none absolute inset-0"
          ></video>
        ) : (
          <>
            <FileVideo className="h-4 w-4" />
            <span>Selecione um vídeo</span>
          </>
        )}
      </Label>
      <input
        type="file"
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelected}
      />

      <Separator />

      <div className="space-y-1">
        <Label htmlFor="transcription_prompt" className="text-sm">
          Prompt de transcrição
        </Label>
        <Textarea
          id="transcription_prompt"
          placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula. (,)"
          className="h-20 resize-none leading-relaxed"
        />

        <Button className="w-full">
          Carregar vídeo
          <Upload className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
