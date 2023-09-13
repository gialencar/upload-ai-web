import { FFmpeg } from "@ffmpeg/ffmpeg";
import coreURL from "../ffmpg/ffmpeg-core.js?url";
import wasmURL from "../ffmpg/ffmpeg-core.wasm?url";
import workerURL from "../ffmpg/ffmpeg-worker.js?url";

let ffmpeg: FFmpeg | null;

export async function getFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      coreURL,
      wasmURL,
      workerURL,
    });
  }

  return ffmpeg;
}
