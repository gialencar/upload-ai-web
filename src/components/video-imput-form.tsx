import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { FileVideo, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "../lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { api } from "../lib/axios";

type Status = "waiting" | "converting" | "uploading" | "generating" | "success";

const statusMessages = {
  converting: "Convertendo...",
  generating: "Transcrevendo...",
  uploading: "Carregando...",
  success: "Sucesso!",
};

export function VideoImputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("waiting");
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

    setStatus("converting");
    const audioFile = await convertVideoToAudio(videoFile);

    const data = new FormData();

    data.append("file", audioFile);

    setStatus("uploading");
    const response = await api.post("/videos", data);

    const videoID = response.data.video.id;

    setStatus("generating");
    await api.post(`/videos/${videoID}/transcription`, {
      prompt,
    });

    setStatus("success");
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
          disabled={status !== "waiting"}
          placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula. (,)"
          className="h-20 resize-none leading-relaxed"
        />

        <Button
          data-success={status === "success"}
          disabled={status !== "waiting"}
          className="w-full data-[success=true]:bg-emerald-400"
        >
          {status === "waiting" ? (
            <>
              Carregar vídeo
              <Upload className="ml-2 h-4 w-4" />
            </>
          ) : (
            statusMessages[status]
          )}
        </Button>
      </div>
    </form>
  );
}
