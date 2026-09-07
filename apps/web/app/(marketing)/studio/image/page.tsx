"use client";

import { useMemo, useState } from "react";
import { ModelCard } from "@/components/studio/model-card";
import { CollapsibleSection } from "@/components/studio/collapsible-section";
import { StyleCards } from "@/components/studio/style-cards";
import { AspectRatioPicker } from "@/components/studio/aspect-ratio-picker";
import { PromptBox } from "@/components/studio/prompt-box";
import { GenerateBar } from "@/components/studio/generate-bar";
import { ResultPanel, type StudioStatus } from "@/components/studio/result-panel";
import { IMAGE_MODELS, IMAGE_STYLES, ASPECT_RATIOS } from "@/lib/models";
import { SHOWCASE_ITEMS } from "@/lib/media";

export default function ImageStudioPage() {
  const [modelId, setModelId] = useState(IMAGE_MODELS[1].id);
  const [prompt, setPrompt] = useState(
    "A majestic mountain landscape at golden hour with dramatic clouds and a serene lake reflection…",
  );
  const [style, setStyle] = useState<string>(IMAGE_STYLES[0]);
  const [aspect, setAspect] = useState<string>(ASPECT_RATIOS[1]);
  const [status, setStatus] = useState<StudioStatus>("idle");
  const [exampleHidden, setExampleHidden] = useState(false);

  const model = IMAGE_MODELS.find((m) => m.id === modelId) ?? IMAGE_MODELS[0];
  const example = SHOWCASE_ITEMS[1];

  const cost = useMemo(() => parseInt(model.costPerUnit, 10) || 1, [model]);

  function handleGenerate() {
    setExampleHidden(false);
    setStatus("loading");
    setTimeout(() => setStatus("done"), 2600);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:flex-row lg:gap-10 lg:py-10">
      <aside className="flex w-full flex-col gap-6 lg:w-[380px] lg:shrink-0">
        <h1 className="font-display text-2xl font-medium text-text">Image Studio</h1>

        <CollapsibleSection title="Model">
          <div className="grid grid-cols-2 gap-2.5">
            {IMAGE_MODELS.map((m) => (
              <ModelCard key={m.id} model={m} selected={m.id === modelId} onSelect={() => setModelId(m.id)} />
            ))}
          </div>
        </CollapsibleSection>

        <PromptBox
          label="Describe your image"
          value={prompt}
          onChange={setPrompt}
          placeholder="A casual, unedited snapshot of…"
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

        <GenerateBar cost={cost} loading={status === "loading"} label="Generate image" onGenerate={handleGenerate} />
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
