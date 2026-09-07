"use client";

import { useEffect, useMemo, useState } from "react";
import { ModelCard } from "@/components/studio/model-card";
import { CollapsibleSection } from "@/components/studio/collapsible-section";
import { StyleCards } from "@/components/studio/style-cards";
import { AspectRatioPicker } from "@/components/studio/aspect-ratio-picker";
import { PromptBox } from "@/components/studio/prompt-box";
import { GenerateBar } from "@/components/studio/generate-bar";
import { ResultPanel, type StudioStatus } from "@/components/studio/result-panel";
import { IMAGE_MODELS, IMAGE_STYLES, ASPECT_RATIOS } from "@/lib/models";
import { SHOWCASE_ITEMS } from "@/lib/media";
import {
  createGeneration,
  enhancePrompt,
  getCreditsBalance,
  getModelCatalog,
  pollGeneration,
  type CatalogEntry,
} from "@/lib/generation-client";

const STYLE_SUFFIXES: Record<string, string> = {
  None: "",
  Cinematic: ", cinematic lighting, dramatic composition, shallow depth of field, film grain",
  Anime: ", anime style, vibrant cel-shaded illustration, clean line art",
  Photo: ", photorealistic, shot on DSLR, natural lighting, high detail",
  Illustration: ", digital illustration, painterly style, rich color palette",
};

export default function ImageStudioPage() {
  const [modelId, setModelId] = useState(IMAGE_MODELS[1].id);
  const [prompt, setPrompt] = useState(
    "A majestic mountain landscape at golden hour with dramatic clouds and a serene lake reflection…",
  );
  const [style, setStyle] = useState<string>(IMAGE_STYLES[0]);
  const [aspect, setAspect] = useState<string>(ASPECT_RATIOS[1]);
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
        for (const entry of res.image) map[entry.id] = entry;
        setCatalog(map);
      })
      .catch(() => {});
    getCreditsBalance()
      .then(setBalance)
      .catch(() => {});
  }, []);

  const model = IMAGE_MODELS.find((m) => m.id === modelId) ?? IMAGE_MODELS[0];
  const catalogEntry = catalog[modelId];
  const example = SHOWCASE_ITEMS[1];

  const cost = catalogEntry?.creditsCost ?? (parseInt(model.costPerUnit, 10) || 1);

  const disabledReason = useMemo(() => {
    if (!prompt.trim()) return "Enter a prompt to generate";
    if (catalogEntry && !catalogEntry.unlocked) return "Upgrade your plan to use this model";
    if (balance !== null && balance < cost) return "Not enough credits";
    return null;
  }, [prompt, catalogEntry, balance, cost]);

  async function handleEnhance(mode: "enhance" | "variation") {
    if (!prompt.trim() || enhanceBusy) return;
    setEnhanceBusy(mode);
    try {
      const result = await enhancePrompt({ prompt, mode, type: "IMAGE" });
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

    const finalPrompt = style !== "None" ? `${prompt}${STYLE_SUFFIXES[style] ?? ""}` : prompt;

    try {
      const { id } = await createGeneration({
        type: "IMAGE",
        model: modelId,
        prompt: finalPrompt,
        settings: { aspectRatio: aspect },
      });
      const result = await pollGeneration(id);
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
        <h1 className="font-display text-2xl font-medium text-text">Image Studio</h1>

        <CollapsibleSection title="Model">
          <div className="grid grid-cols-2 gap-2.5">
            {IMAGE_MODELS.map((m) => (
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
          label="Describe your image"
          value={prompt}
          onChange={setPrompt}
          placeholder="A casual, unedited snapshot of…"
          onEnhance={() => handleEnhance("enhance")}
          onVariation={() => handleEnhance("variation")}
          busy={enhanceBusy}
        />

        <CollapsibleSection title="Style & settings">
          <div className="space-y-5">
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">
                Style
              </p>
              <StyleCards options={IMAGE_STYLES} value={style} onChange={setStyle} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">
                Aspect ratio
              </p>
              <AspectRatioPicker options={ASPECT_RATIOS} value={aspect} onChange={setAspect} />
            </div>
          </div>
        </CollapsibleSection>

        <GenerateBar
          cost={cost}
          loading={status === "loading"}
          label="Generate image"
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
