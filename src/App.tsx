import { Github } from "lucide-react";
import { Button } from "./components/ui/button";
import { Separator } from "./components/ui/separator";
import { Textarea } from "./components/ui/textarea";

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between border-b px-6 py-3 ">
        <h1 className="text-xl font-bold">upload.ai</h1>
        <div className="flex items-center gap-3">
          <span className="text-small text-muted-foreground">
            Desenvolvido com 💜 no NLW da Rocketseat
          </span>

          <Separator orientation="vertical" className="h-6" />

          <Button variant={"outline"}>
            <Github className="mr-2 h-4 w-4" />
            Github
          </Button>
        </div>
      </div>

      <main className="flex flex-1 gap-6 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid flex-1 grid-rows-2 gap-4">
            <Textarea
             placeholder="Inclua o prompt para a IA..."
             className="resize-none p-4 leading-relaxed"
             />
            <Textarea
             placeholder="Resultado gerado pela IA..."
             className="resize-none p-4 leading-relaxed"
             readOnly
             />
          </div>

          <p className="text-sm text-muted-foreground">
            Lembre-se: você pode utilizar a variável{" "}
            <code className="text-violet-400">{`{transcription}`}</code> no seu
            prompt para adicionar o conteúdo da transcrição do vídeo
            selecionado.
          </p>
        </div>
      </main>
    </div>
  );
}
