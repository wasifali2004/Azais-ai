"use client";

import { useMemo, useState } from "react";
import { UploadCloud, Images } from "lucide-react";
import { ModelCard } from "@/components/studio/model-card";
import { CollapsibleSection } from "@/components/studio/collapsible-section";
import { InputSourceTabs } from "@/components/studio/input-source-tabs";
import { AspectRatioPicker } from "@/components/studio/aspect-ratio-picker";
import { PromptBox } from "@/components/studio/prompt-box";
import { GenerateBar } from "@/components/studio/generate-bar";
import { ResultPanel, type StudioStatus } from "@/components/studio/result-panel";
import { VIDEO_MODELS, ASPECT_RATIOS, VIDEO_DURATIONS } from "@/lib/models";
import { SHOWCASE_ITEMS } from "@/lib/media";

export default function VideoStudioPage() {
  const [source, setSource] = useState<"text" | "image">("text");
  const [modelId, setModelId] = useState(VIDEO_MODELS[3].id);
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<string>(ASPECT_RATIOS[0]);
  const [duration, setDuration] = useState<string>(VIDEO_DURATIONS[0]);
  const [status, setStatus] = useState<StudioStatus>("idle");
  const [exampleHidden, setExampleHidden] = useState(false);

  const model = VIDEO_MODELS.find((m) => m.id === modelId) ?? VIDEO_MODELS[0];
  const example = SHOWCASE_ITEMS[0];

  const cost = useMemo(() => {
    const rate = parseFloat(model.costPerUnit);
    const seconds = parseInt(duration, 10) || 5;
    return Math.max(1, Math.round(rate * (model.costPerUnit.includes("/s") ? seconds : 1)));
  }, [model, duration]);

  function handleGenerate() {
    setExampleHidden(false);
    setStatus("loading");
    setTimeout(() => setStatus("done"), 3600);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:flex-row lg:gap-10 lg:py-10">
      <aside className="flex w-full flex-col gap-6 lg:w-[380px] lg:shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-medium text-text">Video Studio</h1>
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-faint">
            {source === "text" ? "Text → Video" : "Image → Video"}
          </span>
        </div>

        <InputSourceTabs value={source} onChange={setSource} />

        {source === "image" && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-8 text-center text-xs text-text-faint transition-colors hover:border-accent/50 hover:text-accent-hi"
            >
              <UploadCloud size={18} />
              <span className="font-medium text-text-muted">Drop or click to upload</span>
              <span>JPG · PNG · WEBP · max 10MB</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface py-8 text-center text-xs text-text-faint transition-colors hover:border-accent/40 hover:text-accent-hi"
            >
              <Images size={18} />
              <span className="font-medium text-text-muted">My images</span>
              <span>From history</span>
            </button>
          </div>
        )}

        <CollapsibleSection title="Model">
          <div className="grid grid-cols-2 gap-2.5">
            {VIDEO_MODELS.map((m) => (
              <ModelCard key={m.id} model={m} selected={m.id === modelId} onSelect={() => setModelId(m.id)} />
            ))}
          </div>
        </CollapsibleSection>

        <PromptBox
          label="Motion description"
          value={prompt}
          onChange={setPrompt}
          placeholder="Describe the motion (optional)…"
        />

        <CollapsibleSection title="Settings">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">
                Aspect ratio
              </p>
              <AspectRatioPicker options={ASPECT_RATIOS} value={aspect} onChange={setAspect} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">
                Duration
              </p>
              <div className="flex gap-2">
                {VIDEO_DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-all ${
                      duration === d
                        ? "border-accent/60 bg-accent-wash text-accent-hi"
                        : "border-border-soft bg-surface text-text-faint hover:text-text-muted"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <GenerateBar cost={cost} loading={status === "loading"} label="Generate video" onGenerate={handleGenerate} />
      </aside>

      <div className="flex flex-1">
        <ResultPanel
          status={status}
          example={example}
          eta={model.eta}
          exampleHidden={exampleHidden}
          onHideExample={() => setExampleHidden((v) => !v)}
          onReset={() => setStatus("idle")}
        />
      </div>
    </div>
  );
}
