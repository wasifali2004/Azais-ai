"use client";

import { useEffect, useMemo, useState } from "react";
import { UploadCloud, Images } from "lucide-react";
import { ModelCard } from "@/components/studio/model-card";
import { CollapsibleSection } from "@/components/studio/collapsible-section";
import { InputSourceTabs } from "@/components/studio/input-source-tabs";
import { AspectRatioPicker } from "@/components/studio/aspect-ratio-picker";
import { PromptBox } from "@/components/studio/prompt-box";
import { GenerateBar } from "@/components/studio/generate-bar";
import { ResultPanel, type StudioStatus } from "@/components/studio/result-panel";
import { VIDEO_MODELS, ASPECT_RATIOS } from "@/lib/models";
import { SHOWCASE_ITEMS } from "@/lib/media";
import {
  createGeneration,
  enhancePrompt,
  getCreditsBalance,
  getModelCatalog,
  pollGeneration,
  type CatalogEntry,
} from "@/lib/generation-client";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function VideoStudioPage() {
  const [source, setSource] = useState<"text" | "image">("text");
  const [modelId, setModelId] = useState(VIDEO_MODELS[3].id);
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<string>(ASPECT_RATIOS[0]);
  const [duration, setDuration] = useState<number | null>(null);
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [status, setStatus] = useState<StudioStatus>("idle");
  const [exampleHidden, setExampleHidden] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [enhanceBusy, setEnhanceBusy] = useState<"enhance" | "variation" | null>(null);

  const [catalog, setCatalog] = useState<Record<string, CatalogEntry>>({});
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    getModelCatalog()
      .then((res) => {
        const map: Record<string, CatalogEntry> = {};
        for (const entry of res.video) map[entry.id] = entry;
        setCatalog(map);
      })
      .catch(() => {});
    getCreditsBalance()
      .then(setBalance)
      .catch(() => {});
  }, []);

  const model = VIDEO_MODELS.find((m) => m.id === modelId) ?? VIDEO_MODELS[0];
  const catalogEntry = catalog[modelId];
  const example = SHOWCASE_ITEMS[0];
  const durations = catalogEntry?.durations ?? [5, 8];

  useEffect(() => {
    if (durations.length && !durations.includes(duration ?? -1)) {
      setDuration(durations[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId, catalog]);

  const cost = useMemo(() => {
    const rate = catalogEntry?.creditsPerSecond ?? parseFloat(model.costPerUnit) ?? 1;
    return Math.max(1, Math.ceil(rate * (duration ?? durations[0] ?? 5)));
  }, [catalogEntry, model, duration, durations]);

  const disabledReason = useMemo(() => {
    if (source === "image" && !uploadName) return "Upload a starting image to generate";
    if (source === "text" && !prompt.trim()) return "Enter a prompt to generate";
    if (catalogEntry && !catalogEntry.unlocked) return "Upgrade your plan to use this model";
    if (balance !== null && balance < cost) return "Not enough credits";
    return null;
  }, [source, uploadName, prompt, catalogEntry, balance, cost]);

  function handleUpload(file: File | undefined) {
    setUploadError(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Only JPG, PNG, or WEBP images are supported");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("Image must be 10MB or smaller");
      return;
    }
    setUploadName(file.name);
  }

  async function handleEnhance(mode: "enhance" | "variation") {
    if (!prompt.trim() || enhanceBusy) return;
    setEnhanceBusy(mode);
    try {
      const result = await enhancePrompt({ prompt, mode, type: "VIDEO" });
      setPrompt(result.prompt);
    } catch {
      // Leave the existing prompt untouched on failure.
    } finally {
      setEnhanceBusy(null);
    }
  }

  async function handleGenerate() {
    setExampleHidden(false);
    setStatus("loading");
    setStartedAt(Date.now());
    setOutputUrl(null);
    setFailureMessage(null);

    try {
      const { id } = await createGeneration({
        type: "VIDEO",
        model: modelId,
        prompt: prompt.trim() || "Animate this image with subtle, natural motion.",
        settings: { aspectRatio: aspect, durationSeconds: duration ?? durations[0] },
      });
      const result = await pollGeneration(id, { timeoutMs: 150_000 });
      if (result.status === "COMPLETE" && result.outputUrl) {
        setOutputUrl(result.outputUrl);
        setStatus("done");
      } else {
        setFailureMessage(result.userMessage ?? "We couldn't generate that — your credits have been refunded.");
        setStatus("failed");
      }
    } catch (err) {
      setFailureMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("failed");
    } finally {
      getCreditsBalance().then(setBalance).catch(() => {});
    }
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
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-8 text-center text-xs text-text-faint transition-colors hover:border-accent/50 hover:text-accent-hi">
                <input
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
                <UploadCloud size={18} />
                <span className="font-medium text-text-muted">
                  {uploadName ?? "Drop or click to upload"}
                </span>
                <span>JPG · PNG · WEBP · max 10MB</span>
              </label>
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface py-8 text-center text-xs text-text-faint transition-colors hover:border-accent/40 hover:text-accent-hi"
              >
                <Images size={18} />
                <span className="font-medium text-text-muted">My images</span>
                <span>From history</span>
              </button>
            </div>
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          </div>
        )}

        <CollapsibleSection title="Model">
          <div className="grid grid-cols-2 gap-2.5">
            {VIDEO_MODELS.map((m) => (
              <ModelCard
                key={m.id}
                model={m}
                selected={m.id === modelId}
                onSelect={() => setModelId(m.id)}
                disabled={catalog[m.id] ? !catalog[m.id].unlocked : false}
                disabledReason="Upgrade your plan to use this model"
              />
            ))}
          </div>
        </CollapsibleSection>

        <PromptBox
          label="Motion description"
          value={prompt}
          onChange={setPrompt}
          placeholder="Describe the motion (optional)…"
          onEnhance={() => handleEnhance("enhance")}
          onVariation={() => handleEnhance("variation")}
          busy={enhanceBusy}
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
                {durations.map((d) => (
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
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <GenerateBar
          cost={cost}
          loading={status === "loading"}
          label="Generate video"
          onGenerate={handleGenerate}
          disabledReason={status === "loading" ? null : disabledReason}
        />
      </aside>

      <div className="flex flex-1">
        <ResultPanel
          status={status}
          example={example}
          eta={model.eta}
          startedAt={startedAt}
          outputUrl={outputUrl}
          failureMessage={failureMessage}
          exampleHidden={exampleHidden}
          onHideExample={() => setExampleHidden((v) => !v)}
          onReset={() => setStatus("idle")}
        />
      </div>
    </div>
  );
}
