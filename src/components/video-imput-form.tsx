import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { FileVideo, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "../lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export function VideoImputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

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

  async function convertVideoToAudio(video: File) {
    console.log("Convert started.");

    const ffmpeg = await getFFmpeg();

    await ffmpeg.writeFile("input.mp4", await fetchFile(video));

    // ffmpeg.on('log', log => {
    //   console.log(log)
    // })

    ffmpeg.on("progress", (progress) => {
      console.log("Convert progress: " + Math.round(progress.progress * 100));
    });

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3",
    ]);

    const data = await ffmpeg.readFile("output.mp3");

    const audioFileBlob = new Blob([data], { type: "audio/mp3" });
    const audioFile = new File([audioFileBlob], "output.mp3", {
      type: "audio/mpeg",
    });

    console.log("Convert finished.");

    return audioFile;
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null;
    }

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  async function handleVideoUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = promptInputRef.current?.value;

    if (!videoFile) {
      return;
    }

    const audioFile = await convertVideoToAudio(videoFile);

    // console.log(audioFile, prompt)
  }

  return (
    <form onSubmit={handleVideoUpload} className="space-y-6">
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
          ref={promptInputRef}
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
